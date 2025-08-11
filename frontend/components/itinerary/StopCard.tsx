import React, { useState } from "react";
import { Stop, Activity } from "@/types/itinerary";
import { X, Plus, Edit2, Trash2 } from "lucide-react";
import Select from "react-select";

const cityOptions = [
  { value: "Delhi", label: "Delhi" },
  { value: "Mumbai", label: "Mumbai" },
  { value: "Bangalore", label: "Bangalore" },
  { value: "Jaipur", label: "Jaipur" },
  { value: "Goa", label: "Goa" },
  // Add more cities as needed
];

interface StopCardProps {
  stop: Stop;
  onEdit: (id: string, updated: Partial<Stop>) => void;
  onDelete: (id: string) => void;
}

const StopCard: React.FC<StopCardProps> = ({ stop, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [city, setCity] = useState(stop.city);
  const [startDate, setStartDate] = useState(stop.startDate.toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(stop.endDate.toISOString().slice(0, 10));
  const [budget, setBudget] = useState(stop.budget || "");
  const [info, setInfo] = useState(stop.info || "");
  const [activities, setActivities] = useState<Activity[]>(stop.activities || []);
  const [activityName, setActivityName] = useState("");
  const [activityTime, setActivityTime] = useState("");
  const [activityCost, setActivityCost] = useState("");

  const handleSave = () => {
    onEdit(stop.id, {
      city,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      budget,
      info,
      activities,
    });
    setIsEditing(false);
  };

  const handleAddActivity = () => {
    if (!activityName || !activityTime) return;
    setActivities([
      ...activities,
      {
        id: Date.now().toString(),
        name: activityName,
        time: activityTime,
        cost: activityCost ? Number(activityCost) : undefined,
      },
    ]);
    setActivityName("");
    setActivityTime("");
    setActivityCost("");
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(activities.filter((a) => a.id !== id));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 flex flex-col gap-4 relative">
      <div className="absolute -top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
        {city || 'Section'}
      </div>
      {isEditing ? (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <Select
              options={cityOptions}
              value={cityOptions.find(opt => opt.value === city) || null}
              onChange={opt => setCity(opt ? opt.value : "")}
              placeholder="Select city..."
              classNamePrefix="react-select"
              className="mb-2"
              isClearable
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Section Details</label>
            <textarea
              className="border rounded px-3 py-2 text-base w-full min-h-[60px]"
              value={info}
              onChange={e => setInfo(e.target.value)}
              placeholder="Section details (travel, hotel, etc.)"
            />
          </div>
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                className="border rounded px-3 py-2 text-base"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                className="border rounded px-3 py-2 text-base"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Budget</label>
              <input
                type="number"
                className="border rounded px-3 py-2 text-base"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="Budget"
                min={0}
              />
            </div>
          </div>
          {/* Activities Input */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
            <div className="font-semibold mb-2">Add Activity</div>
            <div className="flex flex-wrap gap-2 mb-2">
              <input
                className="border rounded px-2 py-1 text-sm"
                value={activityName}
                onChange={e => setActivityName(e.target.value)}
                placeholder="Activity name"
              />
              <input
                className="border rounded px-2 py-1 text-sm"
                value={activityTime}
                onChange={e => setActivityTime(e.target.value)}
                placeholder="Time (e.g. 10:00 AM)"
              />
              <input
                className="border rounded px-2 py-1 text-sm"
                value={activityCost}
                onChange={e => setActivityCost(e.target.value)}
                placeholder="Cost"
                type="number"
                min={0}
              />
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                type="button"
                onClick={handleAddActivity}
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <ul className="space-y-1">
              {activities.map((a) => (
                <li key={a.id} className="flex items-center gap-2 text-sm bg-white border rounded px-2 py-1">
                  <span className="font-medium">{a.name}</span>
                  <span className="text-gray-500">{a.time}</span>
                  {a.cost !== undefined && <span className="text-gray-500">₹{a.cost}</span>}
                  <button
                    className="ml-auto text-red-500 hover:text-red-700"
                    type="button"
                    onClick={() => handleDeleteActivity(a.id)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setIsEditing(false)}>Cancel</button>
            <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleSave}>Save</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <div className="font-bold text-lg text-gray-900">{stop.city}</div>
            <div className="text-gray-500 text-sm whitespace-pre-line">{stop.info || 'All the necessary information about this section. This can be anything like travel section, hotel or any other activity.'}</div>
          </div>
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex-1 min-w-[180px]">
              <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 font-mono text-base">
                Date Range: {stop.startDate.toLocaleDateString()} to {stop.endDate.toLocaleDateString()}
              </div>
            </div>
            <div className="flex-1 min-w-[180px]">
              <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 font-mono text-base">
                Budget: {stop.budget ? `₹${stop.budget}` : 'Not set'}
              </div>
            </div>
          </div>
          {/* Activities List */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
            <div className="font-semibold mb-2">Activities</div>
            <ul className="space-y-1">
              {stop.activities.length === 0 && <li className="text-gray-400">No activities yet.</li>}
              {stop.activities.map((a) => (
                <li key={a.id} className="flex items-center gap-2 text-sm bg-white border rounded px-2 py-1">
                  <span className="font-medium">{a.name}</span>
                  <span className="text-gray-500">{a.time}</span>
                  {a.cost !== undefined && <span className="text-gray-500">₹{a.cost}</span>}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end mt-2 gap-2">
            <button
              className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="w-4 h-4" /> Edit
            </button>
            <button
              className="text-red-500 hover:underline text-sm font-medium flex items-center gap-1"
              onClick={() => onDelete(stop.id)}
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StopCard;
