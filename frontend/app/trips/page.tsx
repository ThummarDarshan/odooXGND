"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CalendarRange, MapPin, Eye, Pencil, Trash2, Plus } from "lucide-react";

interface Trip {
  id: number | string;
  name: string;
  start_date: string;
  end_date: string;
  destinations?: string[]; // list of destination names
  cover?: string;
}

export default function TripsListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrips() {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5001/api/trips", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }).catch(() => null);

        if (!res || !res.ok) {
          // Fallback demo data if backend not available
          setTrips([
            {
              id: 1,
              name: "Paris Getaway",
              start_date: "2024-06-10",
              end_date: "2024-06-18",
              destinations: ["Paris"],
              cover: "/placeholder.jpg",
            },
            {
              id: 2,
              name: "Japan Highlights",
              start_date: "2024-07-05",
              end_date: "2024-07-20",
              destinations: ["Tokyo", "Kyoto", "Osaka"],
              cover: "/placeholder.jpg",
            },
            {
              id: 3,
              name: "NYC & East Coast",
              start_date: "2024-08-01",
              end_date: "2024-08-10",
              destinations: ["New York", "Boston"],
              cover: "/placeholder.jpg",
            },
          ]);
        } else {
          const data = await res.json();
          // Expecting an array of trips
          setTrips(Array.isArray(data.trips) ? data.trips : data);
        }
      } catch (err) {
        setTrips([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, []);

  const handleDelete = async (tripId: Trip["id"]) => {
    const ok = confirm("Delete this trip?");
    if (!ok) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5001/api/trips/${tripId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }).catch(() => null);
      if (!res || !res.ok) {
        // Optimistic remove in demo
        setTrips(prev => prev.filter(t => t.id !== tripId));
        toast({ title: "Deleted (demo)", description: "Removed trip locally." });
        return;
      }
      setTrips(prev => prev.filter(t => t.id !== tripId));
      toast({ title: "Trip deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to delete" });
    }
  };

  const formatRange = (start: string, end: string) => {
    try {
      const s = new Date(start);
      const e = new Date(end);
      const fmt = (d: Date) => d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
      return `${fmt(s)} — ${fmt(e)}`;
    } catch {
      return `${start} — ${end}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-950">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">My Trips</h1>
            <p className="text-slate-500 dark:text-slate-400">Access and manage your upcoming and past trips</p>
          </div>
          <Button onClick={() => router.push("/trips/create")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Trip
          </Button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading trips...</div>
        ) : trips.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">No trips yet.</p>
            <Button onClick={() => router.push("/trips/create")}>Plan your first trip</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Card
                key={trip.id}
                className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col h-full"
              >
                <div className="aspect-video bg-slate-200 dark:bg-slate-700">
                  {trip.cover ? (
                    <img src={trip.cover} alt={trip.name} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{trip.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <CalendarRange className="h-4 w-4" />
                    {formatRange(trip.start_date, trip.end_date)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4" />
                    <span>{trip.destinations?.length ?? 0} destinations</span>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/trips/${trip.id}`)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" /> View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/trips/${trip.id}/edit`)}
                      className="flex items-center gap-2"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDelete(trip.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
