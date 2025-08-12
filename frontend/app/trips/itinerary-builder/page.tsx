"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { v4 as uuidv4 } from "uuid";
import { Stop, Activity } from "@/types/itinerary";
import Select from "react-select";
import { Navigation } from "@/components/navigation";
import { useItineraryStore } from "@/store/itineraryStore";
import { createItinerary, saveItineraryDraft } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const cityOptions = [
    { value: "Delhi", label: "Delhi" },
    { value: "Mumbai", label: "Mumbai" },
    { value: "Bangalore", label: "Bangalore" },
    { value: "Jaipur", label: "Jaipur" },
    { value: "Goa", label: "Goa" },
    { value: "Chennai", label: "Chennai" },
    { value: "Hyderabad", label: "Hyderabad" },
    { value: "Kolkata", label: "Kolkata" },
    { value: "Ahmedabad", label: "Ahmedabad" },
    { value: "Pune", label: "Pune" },
    { value: "Udaipur", label: "Udaipur" },
    { value: "Varanasi", label: "Varanasi" },
    { value: "Agra", label: "Agra" },
    { value: "Manali", label: "Manali" },
    { value: "Shimla", label: "Shimla" },
    { value: "Rishikesh", label: "Rishikesh" },
    { value: "Mysore", label: "Mysore" },
    { value: "Ooty", label: "Ooty" },
    { value: "Darjeeling", label: "Darjeeling" },
];

const ItineraryBuilderPage = () => {
    const searchParams = useSearchParams();
    const tripId = searchParams.get("tripId");
    const tripName = searchParams.get("tripName");
    const stops = useItineraryStore((s) => s.stops);
    const setStops = useItineraryStore((s) => s.setStops);
    const [adding, setAdding] = useState(false);
    const [newCity, setNewCity] = useState<any>(null);
    const [newStart, setNewStart] = useState("");
    const [newEnd, setNewEnd] = useState("");
    const [title, setTitle] = useState(tripName || "");
    const [description, setDescription] = useState("");
    const [information, setInformation] = useState("");
    const [userId] = useState(1); // Replace with actual user id from auth
    const [itineraryId, setItineraryId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    // Add Stop Inline
    const handleAddStop = (e: React.FormEvent) => {
        e.preventDefault();
        let cityValue = newCity?.value;
        if (!cityValue) {
            alert("Please select a city.");
            return;
        }
        if (!newStart || !newEnd) {
            alert("Please select both start and end dates.");
            return;
        }
        if (newEnd < newStart) {
            alert("End date cannot be before start date.");
            return;
        }
        setStops([
            ...stops,
            {
                id: uuidv4(),
                city: cityValue,
                startDate: new Date(newStart),
                endDate: new Date(newEnd),
                activities: [],
            },
        ]);
        setNewCity(null);
        setNewStart("");
        setNewEnd("");
        setAdding(false);
    };

    // Drag and drop
    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const reordered = Array.from(stops);
        const [removed] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, removed);
        setStops(reordered);
    };

    // Activity logic
    const handleAddActivity = (stopId: string, activity: Omit<Activity, "id">) => {
        setStops(
            stops.map((stop) =>
                stop.id === stopId
                    ? {
                        ...stop,
                        activities: [...stop.activities, { ...activity, id: uuidv4() }],
                    }
                    : stop
            )
        );
    };

    // Calculate total cost
    const totalCost = stops.reduce(
        (sum, stop) =>
            sum + stop.activities.reduce((aSum, a) => aSum + (a.cost || 0), 0),
        0
    );

    // Save Draft Handler
    const handleSaveDraft = async () => {
        setSaving(true);
        try {
            let currentItineraryId = itineraryId;
            // If no itineraryId, create first
            if (!currentItineraryId) {
                const res = await createItinerary({
                    user_id: userId,
                    title: title || tripName || "Untitled Trip",
                    description,
                    start_date: stops[0]?.startDate?.toISOString().slice(0, 10) || "",
                    end_date: stops[stops.length - 1]?.endDate?.toISOString().slice(0, 10) || "",
                    stops,
                    cost: totalCost,
                    information,
                });
                currentItineraryId = res.id;
                setItineraryId(res.id);
            }
            // Now PATCH (update) the draft
            await saveItineraryDraft({
                user_id: userId,
                title: title || tripName || "Untitled Trip",
                description,
                start_date: stops[0]?.startDate?.toISOString().slice(0, 10) || "",
                end_date: stops[stops.length - 1]?.endDate?.toISOString().slice(0, 10) || "",
                stops,
                cost: totalCost,
                information,
                itineraryId: Number(currentItineraryId),
            });
            toast({ title: "Draft saved!", description: "Your itinerary draft was saved successfully.", variant: "default" });
        } catch (e) {
            toast({ title: "Failed to save draft", description: "There was an error saving your itinerary. Please try again.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    // UI
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navigation />
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
                <h1 className="text-2xl font-bold">{title || tripName || "Build Your Trip"}</h1>
                <button
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                    onClick={handleSaveDraft}
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save Draft"}
                </button>
            </header>
            {/* Stops List Section */}
            <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
                <div className="flex justify-end mb-4">
                    <div className="bg-blue-100 text-blue-800 rounded-lg px-4 py-2 font-semibold text-lg shadow">
                        Total Cost: ₹{totalCost}
                    </div>
                </div>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="stops-list">
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="space-y-6"
                            >
                                {stops.map((stop, idx) => (
                                    <Draggable
                                        key={stop.id}
                                        draggableId={stop.id}
                                        index={idx}
                                    >
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                <StopCard
                                                    stop={stop}
                                                    onAddActivity={handleAddActivity}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
                {/* Inline Add Stop Form */}
                <div className="mt-10 flex flex-col items-center">
                    {adding ? (
                        <form
                            onSubmit={handleAddStop}
                            className="w-full max-w-md bg-white border border-blue-200 rounded-2xl shadow-lg p-6 flex flex-col gap-4"
                        >
                            <h2 className="text-lg font-bold text-blue-700 mb-2">
                                Add New Stop
                            </h2>
                            <Select
                                options={cityOptions}
                                value={cityOptions.find(opt => opt.value === newCity?.value) || null}
                                onChange={(selected) => setNewCity(selected)}
                                placeholder="Select city..."
                                classNamePrefix="react-select"
                                isClearable
                            />
                            <div className="flex gap-4">
                                <input
                                    type="date"
                                    value={newStart}
                                    onChange={(e) => setNewStart(e.target.value)}
                                    className="border rounded px-3 py-2 flex-1"
                                    required
                                />
                                <input
                                    type="date"
                                    value={newEnd}
                                    onChange={(e) => setNewEnd(e.target.value)}
                                    className="border rounded px-3 py-2 flex-1"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setAdding(false)}
                                    className="px-4 py-2 rounded bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded bg-blue-600 text-white"
                                >
                                    Add
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button
                            className="w-full max-w-md px-6 py-4 rounded-2xl border-2 border-blue-600 text-blue-700 font-bold text-lg bg-white shadow hover:bg-blue-50 transition flex items-center justify-center gap-2"
                            onClick={() => setAdding(true)}
                        >
                            + Add Stop
                        </button>
                    )}
                </div>
            </main>
            {/* Next Button */}
            <footer className="px-6 py-4 border-t bg-white flex justify-end">
                <button
                    className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                    onClick={async () => {
                        await handleSaveDraft();
                        if (itineraryId) {
                            router.push(`/trips/itinerary-view?id=${itineraryId}`);
                        }
                    }}
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Next"}
                </button>
            </footer>
        </div>
    );
};

// StopCard component for each stop
const StopCard: React.FC<{
    stop: Stop;
    onAddActivity: (stopId: string, activity: Omit<Activity, "id">) => void;
}> = ({ stop, onAddActivity }) => {
    const [showActivityForm, setShowActivityForm] = useState(false);
    const [activityName, setActivityName] = useState("");
    const [activityTime, setActivityTime] = useState("");
    const [activityCost, setActivityCost] = useState("");

    const handleAdd = () => {
        if (!activityName) {
            alert("Please enter an activity name.");
            return;
        }
        if (!activityTime) {
            alert("Please select a time for the activity.");
            return;
        }
        if (activityCost && Number(activityCost) < 0) {
            alert("Cost cannot be negative.");
            return;
        }
        onAddActivity(stop.id, {
            name: activityName,
            time: activityTime,
            cost: activityCost ? Number(activityCost) : undefined,
        });
        setActivityName("");
        setActivityTime("");
        setActivityCost("");
        setShowActivityForm(false);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 flex flex-col gap-4">
            <div className="font-bold text-lg text-blue-700">{stop.city}</div>
            <div className="text-gray-500 text-sm">
                {stop.startDate.toLocaleDateString()} -{" "}
                {stop.endDate.toLocaleDateString()}
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
                <div className="font-semibold mb-2">Activities</div>
                <ul className="space-y-1">
                    {stop.activities.length === 0 && (
                        <li className="text-gray-400">No activities yet.</li>
                    )}
                    {stop.activities.map((a) => (
                        <li
                            key={a.id}
                            className="flex items-center gap-2 text-sm bg-white border rounded px-2 py-1"
                        >
                            <span className="font-medium">{a.name}</span>
                            <span className="text-gray-500">{a.time}</span>
                            {a.cost !== undefined && (
                                <span className="text-gray-500">₹{a.cost}</span>
                            )}
                        </li>
                    ))}
                </ul>
                {showActivityForm ? (
                    <div className="flex flex-wrap gap-2 mt-3">
                        <input
                            className="border rounded px-2 py-1 text-sm"
                            value={activityName}
                            onChange={(e) => setActivityName(e.target.value)}
                            placeholder="Activity name"
                            required
                        />
                        <input
                            className="border rounded px-2 py-1 text-sm"
                            value={activityTime}
                            onChange={(e) => setActivityTime(e.target.value)}
                            placeholder="Time"
                            type="time"
                            required
                        />
                        <input
                            className="border rounded px-2 py-1 text-sm"
                            value={activityCost}
                            onChange={(e) => setActivityCost(e.target.value)}
                            placeholder="Cost"
                            type="number"
                            min={0}
                        />
                        <button
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                            type="button"
                            onClick={handleAdd}
                        >
                            Add
                        </button>
                        <button
                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                            type="button"
                            onClick={() => setShowActivityForm(false)}
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        className="mt-3 px-4 py-2 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200 hover:bg-blue-100"
                        onClick={() => setShowActivityForm(true)}
                    >
                        + Add Activity
                    </button>
                )}
            </div>
        </div>
    );
};

export default ItineraryBuilderPage;
