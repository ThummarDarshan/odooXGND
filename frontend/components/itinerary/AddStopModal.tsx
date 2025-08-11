import React, { useState } from "react";
import { Stop } from "@/types/itinerary";

interface AddStopModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (stop: Omit<Stop, "id" | "activities">) => void;
}

const AddStopModal: React.FC<AddStopModalProps> = ({ open, onClose, onAdd }) => {
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !startDate || !endDate) return;
    onAdd({ city, startDate: new Date(startDate), endDate: new Date(endDate) });
    setCity("");
    setStartDate("");
    setEndDate("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Stop</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStopModal;
