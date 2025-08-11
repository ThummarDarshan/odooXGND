"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Navigation } from "@/components/navigation";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Stop } from "@/types/itinerary";
import { useSearchParams } from "next/navigation";
import { fetchItinerary } from "@/lib/api";

const BigCalendar = dynamic(
  () => import("react-big-calendar").then((mod) => mod.Calendar),
  { ssr: false }
);

import { momentLocalizer, Event } from "react-big-calendar";

type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  city?: string;
};

const cityColors: Record<string, string> = {
  Delhi: "#2563eb",
  Agra: "#16a34a",
};

// Demo stops
const demoStops: Stop[] = [
  {
    id: "1",
    city: "Delhi",
    startDate: new Date("2025-09-01"),
    endDate: new Date("2025-09-03"),
    activities: [
      { id: "a1", name: "Red Fort", time: "09:00", cost: 200 },
      { id: "a2", name: "Qutub Minar", time: "13:00", cost: 150 },
    ],
  },
  {
    id: "2",
    city: "Agra",
    startDate: new Date("2025-09-04"),
    endDate: new Date("2025-09-05"),
    activities: [{ id: "a3", name: "Taj Mahal", time: "10:00", cost: 500 }],
  },
];

const ItineraryViewPage = () => {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [stops, setStops] = useState<Stop[]>([]);
  const searchParams = useSearchParams();
  const itineraryId = searchParams.get("id");

  useEffect(() => {
    if (itineraryId) {
      fetchItinerary(Number(itineraryId)).then((data) => {
        // Convert date strings to Date objects for calendar/list
        const stops = (data.destinations || []).map((city: string, idx: number) => ({
          id: idx.toString(),
          city,
          startDate: new Date(data.start_date),
          endDate: new Date(data.end_date),
          activities: (data.activities[idx] || []).map((a: any, aIdx: number) => ({ ...a, id: a.id || `${idx}-${aIdx}` })),
        }));
        setStops(stops);
      });
    }
  }, [itineraryId]);

  const localizer = useMemo(() => momentLocalizer(moment), []);

  const events: CalendarEvent[] = useMemo(() => {
    return stops.flatMap((stop) =>
      stop.activities.map((a) => {
        const date = new Date(stop.startDate);
        const [h, m] = a.time.split(":");
        date.setHours(Number(h), Number(m), 0, 0);

        return {
          title: `${a.name}${a.cost ? ` — ₹${a.cost}` : ""}`,
          start: new Date(date),
          end: new Date(date.getTime() + 60 * 60 * 1000), // 1 hour duration
          allDay: false,
          city: stop.city,
        };
      })
    );
  }, [stops]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm">
        <h1 className="text-2xl font-bold">Itinerary Overview</h1>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded ${
              view === "list" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setView("list")}
          >
            List View
          </button>
          <button
            className={`px-4 py-2 rounded ${
              view === "calendar" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setView("calendar")}
          >
            Calendar View
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full">
        {view === "list" ? (
          <ItineraryListView stops={stops} />
        ) : (
          <div className="bg-white rounded-lg shadow p-4">
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 550 }}
              views={["month", "week", "day", "agenda"]}
              defaultView="month"
              popup
              eventPropGetter={(event: Event & { city?: string }) => ({
                style: {
                  backgroundColor: cityColors[event.city ?? ""] || "#6b7280",
                  color: "white",
                  borderRadius: "6px",
                  padding: "2px 6px",
                },
              })}
            />
          </div>
        )}
      </main>

      <footer className="px-6 py-4 border-t bg-white flex justify-between shadow-sm">
        <button className="px-6 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">
          Edit Trip
        </button>
        <button className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
          Save & Exit
        </button>
      </footer>
    </div>
  );
};

const ItineraryListView: React.FC<{ stops: Stop[] }> = ({ stops }) => {
  const formatDate = (date: Date) => moment(date).format("DD/MM/YYYY");

  return (
    <div className="space-y-6">
      {stops.map((stop) => (
        <div
          key={stop.id}
          className="bg-white rounded-lg shadow p-4 border-l-4"
          style={{ borderColor: cityColors[stop.city] || "#6b7280" }}
        >
          <div className="font-bold text-lg text-blue-700">
            {stop.city} — {formatDate(stop.startDate)} to {formatDate(stop.endDate)}
          </div>
          <ul className="mt-2 space-y-1">
            {stop.activities.map((a) => (
              <li
                key={a.id}
                className="flex gap-2 text-sm items-center bg-gray-50 p-2 rounded"
              >
                <span className="text-gray-600 w-12">{a.time}</span>
                <span className="font-medium">{a.name}</span>
                {a.cost !== undefined && (
                  <span className="text-gray-500">₹{a.cost}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ItineraryViewPage;
