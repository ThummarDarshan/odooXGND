"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CalendarRange, MapPin, Eye, Pencil, Trash2 } from "lucide-react";
import { decodeJWT } from "@/lib/jwt-decode";
import { apiRequest } from "@/lib/api";

interface Trip {
  id: number | string;
  name: string;
  start_date: string;
  end_date: string;
  destinations?: string[];
  cover?: string;
  updated_at?: string;
  created_at?: string;
}

export default function MyTripsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrips() {
      setLoading(true);
      setAuthError(null);
      let userId;
      try {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const payload = decodeJWT(token);
            userId = payload?.id || payload?.user_id || payload?.userId;
          } catch {
            // ignore decode errors, just don't set userId
          }
        }
        if (!userId) {
          setAuthError("Could not determine user. Showing no trips.");
          setTrips([]);
          setLoading(false);
          return;
        }
        // Fetch all trips for the user
        const data = await apiRequest(`/trips/user/${userId}`);
        setTrips(Array.isArray(data.trips) ? data.trips : data);
      } catch (err: any) {
        setTrips([]);
        setAuthError(err?.message || "Failed to fetch trips");
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, []);

  const handleDelete = async (tripId: Trip["id"]) => {
    if (!confirm("Delete this trip?")) return;
    try {
      await apiRequest(`/trips/${tripId}`, { method: "DELETE" });
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      toast({ title: "Trip deleted successfully." });
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

  // Sort trips by updated_at descending (latest updated first)
  const sortedTrips = [...trips].sort((a, b) => {
    const aDate = new Date(a.updated_at || a.created_at || a.start_date);
    const bDate = new Date(b.updated_at || b.created_at || b.start_date);
    return bDate.getTime() - aDate.getTime();
  });

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
            + Add Trip
          </Button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading trips...</div>
        ) : trips.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">{authError ? authError : "No trips yet."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTrips.map((trip) => (
              <Card
                key={trip.id}
                className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col h-full"
              >
                <div className="aspect-video bg-slate-200 dark:bg-slate-700">
                  {trip.cover ? (
                    <img
                      src={trip.cover.startsWith('http') ? trip.cover : `http://localhost:5001${trip.cover}`}
                      alt={trip.name}
                      className="w-full h-full object-cover"
                    />
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
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                    <span>Updated {trip.updated_at ? new Date(trip.updated_at).toLocaleString() : "never"}</span>
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
