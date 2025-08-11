"use client";

import React from "react";
import { Stop } from "@/types/itinerary";
import { Tooltip } from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

// Helper: get days between dates
function getDaysBetween(start: Date, end: Date) {
  const days = [];
  let current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

const formatDate = (date: Date) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getAllDates = (stops: Stop[]) => {
  let allDates: Date[] = [];
  stops.forEach(stop => {
    allDates = allDates.concat(getDaysBetween(stop.startDate, stop.endDate));
  });
  const unique = Array.from(new Set(allDates.map(d => d.getTime()))).map(t => new Date(t));
  unique.sort((a, b) => a.getTime() - b.getTime());
  return unique;
};

const getAllCities = (stops: Stop[]) => Array.from(new Set(stops.map(s => s.city)));

// Assign each city a unique Tailwind color
const cityColors = [
  "bg-blue-200 text-blue-800",
  "bg-green-200 text-green-800",
  "bg-purple-200 text-purple-800",
  "bg-pink-200 text-pink-800",
  "bg-yellow-200 text-yellow-800",
];

export default function ItineraryCalendarView({ stops }: { stops: Stop[] }) {
  const dates = getAllDates(stops);
  const cities = getAllCities(stops);

  const dayCityMap: Record<string, Record<string, { name: string; time: string; cost?: number }[]>> = {};
  dates.forEach(date => {
    const dateStr = formatDate(date);
    dayCityMap[dateStr] = {};
    cities.forEach(city => {
      const stop = stops.find(s => s.city === city && date >= s.startDate && date <= s.endDate);
      if (stop) {
        dayCityMap[dateStr][city] = stop.activities.filter(a => a.time);
      } else {
        dayCityMap[dateStr][city] = [];
      }
    });
  });

  const todayStr = formatDate(new Date());

  return (
    <div className="overflow-x-auto border rounded-lg shadow-sm">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 sticky top-0 z-10">
            <th className="px-4 py-2 text-left font-bold text-gray-700 w-32 sticky left-0 bg-gray-100 border-r">
              Date
            </th>
            {cities.map((city, idx) => (
              <th key={city} className="px-4 py-2 text-left font-bold text-gray-700">
                <span className={cn("px-2 py-1 rounded-full text-sm font-medium", cityColors[idx % cityColors.length])}>
                  🏙️ {city}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dates.map(date => {
            const dateStr = formatDate(date);
            return (
              <tr
                key={dateStr}
                className={cn(
                  "border-b transition-colors",
                  dateStr === todayStr ? "bg-yellow-50" : "hover:bg-gray-50"
                )}
              >
                {/* Sticky date column */}
                <td className="px-4 py-2 font-semibold sticky left-0 bg-white border-r">
                  {dateStr}
                </td>
                {cities.map((city, idx) => (
                  <td key={city} className="px-4 py-2 align-top">
                    {dayCityMap[dateStr][city].length > 0 ? (
                      <ul className="space-y-2">
                        {dayCityMap[dateStr][city].map((a, j) => (
                          <Tooltip key={j}>
                            <li
                              className={cn(
                                "flex items-center gap-2 px-3 py-1 rounded-lg shadow-sm text-sm border cursor-pointer hover:shadow-md transition",
                                cityColors[idx % cityColors.length]
                              )}
                            >
                              <span className="font-mono">{a.time}</span>
                              <span className="font-medium">{a.name}</span>
                              {a.cost !== undefined && (
                                <span className="ml-auto text-xs text-gray-600">₹{a.cost}</span>
                              )}
                            </li>
                          </Tooltip>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400 text-sm italic">No activities</span>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
