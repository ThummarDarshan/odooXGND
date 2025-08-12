"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Navigation } from "@/components/navigation";
import moment from "moment";
import { Stop } from "@/types/itinerary";
import { useSearchParams } from "next/navigation";
import { fetchItinerary } from "@/lib/api";
import Link from "next/link";

// Schedule-X imports
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewWeek,
  createViewMonthGrid,
  createViewMonthAgenda,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import "@schedule-x/theme-default/dist/index.css";
import "@/app/custom-sx-calendar.css";

type CalendarEvent = {
  id: string;
  title: string;
  start: string; // ISO string
  end: string;   // ISO string
  calendarId?: string;
};

const cityColors: Record<string, string> = {
  Delhi: "#2563eb",
  Agra: "#16a34a",
};

// Demo stops (fallback if no itinerary is loaded)
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
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const itineraryId = searchParams.get("id");

  useEffect(() => {
    if (!itineraryId) {
      fetch("http://localhost:5001/api/itineraries")
        .then((res) => res.json())
        .then((data) => {
          setItineraries(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      fetchItinerary(Number(itineraryId)).then((data) => {
        // Defensive: destinations may be string, array, or malformed
        let destinations = data.destinations;
        if (typeof destinations === "string") {
          try {
            destinations = JSON.parse(destinations);
          } catch {
            destinations = [];
          }
        }
        if (!Array.isArray(destinations)) destinations = [];
        // Parse each stop if string, skip if invalid
        const stops = destinations.map((stop: any, idx: number) => {
          if (typeof stop === "string") {
            try {
              stop = JSON.parse(stop);
            } catch {
              return null;
            }
          }
          if (!stop || !stop.city) return null;
          let startDate = stop.startDate ? new Date(stop.startDate) : null;
          let endDate = stop.endDate ? new Date(stop.endDate) : null;
          if (!startDate || isNaN(startDate.getTime())) startDate = null;
          if (!endDate || isNaN(endDate.getTime())) endDate = null;
          return {
            ...stop,
            startDate,
            endDate,
            activities: Array.isArray(stop.activities)
              ? stop.activities.map((a: any, aIdx: number) => ({
                  ...a,
                  id: a.id || `${idx}-${aIdx}`,
                }))
              : [],
          };
        }).filter(Boolean);
        setStops(stops);
      });
    }
  }, [itineraryId]);

  // Convert stops → Schedule-X events (with range events for each stop)
  const events: CalendarEvent[] = useMemo(() => {
    // Activity events (point events)
    const activityEvents = stops.flatMap((stop) =>
      stop.activities.map((a) => {
        const date = new Date(stop.startDate);
        const [h, m] = a.time.split(":");
        date.setHours(Number(h), Number(m), 0, 0);
        const start = date.toISOString();
        const end = new Date(date.getTime() + 60 * 60 * 1000).toISOString();
        return {
          id: a.id,
          title: `${a.name}${a.cost ? ` — ₹${a.cost}` : ""}`,
          start,
          end,
          calendarId: stop.city,
        };
      })
    );
    // Range events for each stop (city block)
    const rangeEvents = (stops.map((stop) => {
      let startDate: Date | null = stop.startDate ? new Date(stop.startDate) : null;
      let endDate: Date | null = stop.endDate ? new Date(stop.endDate) : null;
      // Defensive: Only add event if both dates are valid
      if (!startDate || isNaN(startDate.getTime()) || !endDate || isNaN(endDate.getTime())) return null;
      return {
        id: `range-${stop.id}`,
        title: `${stop.city} stay` + (stop.activities.length > 0 ? `: ${stop.activities.map((a: any) => a.name).join(", ")}` : ""),
        start: startDate.toISOString(),
        end: new Date(endDate.getTime() + 24*60*60*1000).toISOString(),
        calendarId: stop.city,
      };
    }).filter(Boolean) as CalendarEvent[]);
    return [...activityEvents, ...rangeEvents];
  }, [stops]);

  // Schedule-X setup
  const eventsService = useMemo(() => createEventsServicePlugin(), []);
  const calendarApp = useCalendarApp({
    views: [
      createViewMonthGrid(),
      createViewMonthAgenda(),
      createViewWeek(),
      createViewDay(),
    ],
    events,
    plugins: [eventsService],
    calendars: Object.keys(cityColors).reduce((acc, city) => {
      acc[city] = {
        colorName: city, // required by CalendarType
        label: city,     // optional, maps to title
        // Optionally, you can add lightColors/darkColors if needed
      };
      return acc;
    }, {} as Record<string, import("@schedule-x/calendar").CalendarType>),
  });

  // Helper: get the earliest start and latest end from stops array, robust to missing/invalid data and supports both string and Date
  function getItineraryDateRange(destinations: any[]): { start: string | null, end: string | null } {
    if (!Array.isArray(destinations) || destinations.length === 0) return { start: null, end: null };
    // Try to parse each stop if it's a string (bad DB data)
    const stops = destinations.map((stop) => {
      if (typeof stop === "string") {
        try {
          return JSON.parse(stop);
        } catch {
          return null;
        }
      }
      return stop;
    }).filter(Boolean);
    const validStops = stops.filter((stop) => {
      if (!stop) return false;
      const start = stop.startDate instanceof Date ? stop.startDate : new Date(stop.startDate);
      const end = stop.endDate instanceof Date ? stop.endDate : new Date(stop.endDate);
      return start instanceof Date && !isNaN(start.getTime()) && end instanceof Date && !isNaN(end.getTime());
    });
    if (validStops.length === 0) return { start: null, end: null };
    const start = validStops.reduce((min, stop) => {
      const d = stop.startDate instanceof Date ? stop.startDate : new Date(stop.startDate);
      const minD = min.startDate instanceof Date ? min.startDate : new Date(min.startDate);
      return d < minD ? stop : min;
    }).startDate;
    const end = validStops.reduce((max, stop) => {
      const d = stop.endDate instanceof Date ? stop.endDate : new Date(stop.endDate);
      const maxD = max.endDate instanceof Date ? max.endDate : new Date(max.endDate);
      return d > maxD ? stop : max;
    }).endDate;
    return { start, end };
  }

  // Helper: get all valid city names from stops array
  function getItineraryCities(destinations: any[]): string {
    if (!Array.isArray(destinations) || destinations.length === 0) return "No stops";
    // Try to parse each stop if it's a string (bad DB data)
    const stops = destinations.map((stop) => {
      if (typeof stop === "string") {
        try {
          return JSON.parse(stop);
        } catch {
          return null;
        }
      }
      return stop;
    }).filter(Boolean);
    const cities = stops
      .map((stop) => stop && stop.city ? stop.city : null)
      .filter((city) => !!city);
    return cities.length > 0 ? cities.join(", ") : "No stops";
  }

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

      <main className="flex-1 px-2 py-4 max-w-4xl mx-auto w-full">
        {!itineraryId ? (
          <div className="space-y-8">
            <h2 className="text-xl font-bold mb-4">Itinerary History</h2>
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : itineraries.length === 0 ? (
              <div className="text-gray-500">No itineraries found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {itineraries.map((itinerary) => {
                  // Decrypt/parse destination values if they are stringified JSON
                  let destinations = itinerary.destinations;
                  if (typeof destinations === "string") {
                    try {
                      destinations = JSON.parse(destinations);
                    } catch {
                      destinations = [];
                    }
                  }
                  const { start, end } = getItineraryDateRange(destinations);
                  const cities = getItineraryCities(destinations);
                  return (
                    <Link
                      key={itinerary.id}
                      href={`/trips/itinerary-view?id=${itinerary.id}`}
                      className="block bg-white rounded-xl shadow p-6 border-l-8 hover:shadow-lg transition border-blue-400"
                    >
                      {itinerary.cover && (
                        <div className="mb-3 rounded-lg overflow-hidden h-36 w-full bg-gray-100 flex items-center justify-center">
                          <img
                            src={itinerary.cover.startsWith("/uploads/") ? `http://localhost:5001${itinerary.cover}` : itinerary.cover}
                            alt={itinerary.trip_name || itinerary.title || "Trip Banner"}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <div className="font-bold text-lg text-blue-700 mb-1">{itinerary.trip_name || itinerary.title || "Untitled Trip"}</div>
                      <div className="text-gray-500 text-sm mb-2">
                        {start && end ? `${moment(start).format("DD/MM/YYYY")} to ${moment(end).format("DD/MM/YYYY")}` : "No valid dates"}
                      </div>
                      <div className="text-gray-600 text-xs">
                        {cities}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <>
            {view === "list" ? (
              <ItineraryListView stops={stops} />
            ) : (
              <div className="bg-white rounded-xl shadow p-2 md:p-6 flex flex-col items-center justify-center min-h-[600px] custom-sx-calendar">
                <div className="w-full max-w-3xl">
                  <ScheduleXCalendar 
                    calendarApp={calendarApp} 
                  />
                </div>
              </div>
            )}
          </>
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
  const formatDate = (date: Date | null) =>
    date && !isNaN(date.getTime()) ? moment(date).format("DD/MM/YYYY") : "Date unavailable";

  if (!stops || stops.length === 0) {
    return <div className="text-gray-500">No valid stops found.</div>;
  }

  return (
    <div className="space-y-8">
      {stops.map((stop) => {
        if (!stop.city) return null;
        const hasValidDates = stop.startDate && stop.endDate && !isNaN(stop.startDate.getTime()) && !isNaN(stop.endDate.getTime());
        return (
          <div
            key={stop.id}
            className="bg-white rounded-xl shadow p-6 border-l-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            style={{ borderColor: cityColors[stop.city] || "#6b7280" }}
          >
            <div>
              <div className="font-bold text-xl text-blue-700 mb-1">
                {stop.city}
              </div>
              <div className="text-gray-500 text-sm mb-2">
                {hasValidDates
                  ? `${formatDate(stop.startDate)} to ${formatDate(stop.endDate)}`
                  : "Date unavailable"}
              </div>
              {Array.isArray(stop.activities) && stop.activities.length > 0 ? (
                <ul className="space-y-2">
                  {stop.activities.map((a, idx) => (
                    <li
                      key={a.id || `${stop.id}-${idx}`}
                      className="flex gap-3 text-base items-center bg-blue-50 p-2 rounded-lg border border-blue-100"
                    >
                      <span className="text-blue-600 font-semibold w-16">{a.time}</span>
                      <span className="font-medium flex-1">{a.name}</span>
                      {a.cost !== undefined && (
                        <span className="text-blue-500 font-semibold">₹{a.cost}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-400 text-sm">No activities</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ItineraryViewPage;
