"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Eye, TrendingUp, TrendingDown } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function TrackTripsPage() {
  const router = useRouter();
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItineraries() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        let userId;
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userId = payload?.id || payload?.user_id || payload?.userId;
          } catch {}
        }
        let data = [];
        if (userId) {
          const res = await apiRequest(`/itineraries?user_id=${userId}`);
          data = Array.isArray(res) ? res : [];
        }
        setItineraries(data);
      } catch {
        setItineraries([]);
      } finally {
        setLoading(false);
      }
    }
    fetchItineraries();
  }, []);

  // Helper to determine trip status based on stops
  function getTripStatus(stops: any[]): "upcoming" | "ongoing" | "completed" {
    const now = new Date();
    if (!stops || stops.length === 0) return "upcoming";
    const startDates = stops.map(s => new Date(s.startDate || s.start_date)).filter(d => !isNaN(d.getTime()));
    const endDates = stops.map(s => new Date(s.endDate || s.end_date)).filter(d => !isNaN(d.getTime()));
    if (startDates.length === 0 || endDates.length === 0) return "upcoming";
    const minStart = new Date(Math.min(...startDates.map(d => d.getTime())));
    const maxEnd = new Date(Math.max(...endDates.map(d => d.getTime())));
    if (now < minStart) return "upcoming";
    if (now > maxEnd) return "completed";
    return "ongoing";
  }

  // Group itineraries by status
  const grouped = { upcoming: [], ongoing: [], completed: [] } as Record<string, any[]>;
  itineraries.forEach(itin => {
    let stops = itin.destinations;
    if (typeof stops === "string") {
      try { stops = JSON.parse(stops); } catch { stops = []; }
    }
    const status = getTripStatus(stops);
    grouped[status].push({ ...itin, stops });
  });

  // Card UI (same as MyTrips/profile, with budget/cost and Track button)
  function TripCard({ itin }: { itin: any }) {
    const { stops, title, trip_name, cover, cost, budget, id } = itin;
    const start = stops && stops.length > 0 ? new Date(stops[0].startDate || stops[0].start_date) : null;
    const end = stops && stops.length > 0 ? new Date(stops[stops.length-1].endDate || stops[stops.length-1].end_date) : null;
    return (
      <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col h-full">
        <div className="aspect-video bg-slate-200 dark:bg-slate-700 relative">
          {cover ? (
            <img
              src={cover.startsWith('http') ? cover : `http://localhost:5001${cover}`}
              alt={trip_name || title}
              className="w-full h-full object-cover"
            />
          ) : null}
          <div className="absolute top-2 left-2 bg-white/80 dark:bg-slate-900/80 rounded px-3 py-1 text-xs font-semibold flex gap-2 items-center">
            <TrendingUp className="h-4 w-4 text-green-500" /> Budget: ₹{budget ?? '-'}
            <TrendingDown className="h-4 w-4 text-red-500 ml-3" /> Cost: ₹{cost ?? '-'}
          </div>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{trip_name || title}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {start && end ? `${start.toLocaleDateString()} — ${end.toLocaleDateString()}` : "No valid dates"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="h-4 w-4" />
            <span>{stops?.length ?? 0} stops</span>
          </div>
          <div className="mt-auto pt-4 flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/trips/itinerary-view?id=${id}`)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" /> View
            </Button>
            <Button
              size="sm"
              variant="default"
              className="flex items-center gap-2"
              onClick={() => alert('Tracking for this trip coming soon!')}
            >
              Track
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-950">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-8">Track Your Trips</h1>
        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading trips...</div>
        ) : (
          <>
            {(["upcoming", "ongoing", "completed"] as const).map(status => (
              <div key={status} className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 capitalize">{status} Trips</h2>
                {grouped[status].length === 0 ? (
                  <div className="text-slate-400 text-center py-8">No {status} trips.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {grouped[status].map(itin => <TripCard key={itin.id} itin={itin} />)}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
