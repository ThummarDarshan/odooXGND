"use client"

import React, { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { addMonths, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from "date-fns";

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface CalendarProps {
  selectedDates?: Date[];
  onDateClick?: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDates = [], onDateClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-2 px-2">
      <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} className="text-gray-500 px-2">&#60;</button>
      <span className="font-semibold text-gray-700">{format(currentMonth, "MMMM")}</span>
      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="text-gray-500 px-2">&#62;</button>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const date = startOfWeek(currentMonth, { weekStartsOn: 1 });
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="w-8 text-center text-xs font-medium text-gray-400">
          {format(addDays(date, i), "EEEEE")}
        </div>
      );
    }
    return <div className="flex">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const isSelected = selectedDates.some(sel => isSameDay(sel, day));
        days.push(
          <div
            key={day.toString()}
            className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-sm
              ${!isSameMonth(day, monthStart) ? "text-gray-300" : isSelected ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"}
              ${isSelected ? "font-bold" : ""}`}
            onClick={() => isSameMonth(day, monthStart) && onDateClick && onDateClick(day)}
          >
            {formattedDate}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="flex justify-center" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="inline-block p-4 bg-white rounded-lg shadow border w-fit">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

Calendar.displayName = "Calendar"

export { Calendar }
