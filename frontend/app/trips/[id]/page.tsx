"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarRange, MapPin, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Trip {
  id: number | string;
  name: string;
  start_date: string;
  end_date: string;
  destinations?: string[];
  cover?: string;
  description?: string;
}

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const tripId = params?.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrip() {
      if (!tripId) return;
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5001/api/trips/${tripId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }).catch(() => null);
        if (!res || !res.ok) {
          // demo fallback
          setTrip({
            id: tripId,
            name: "Sample Trip",
            start_date: "2024-07-01",
            end_date: "2024-07-10",
            destinations: ["Paris", "London"],
            cover: "/placeholder.jpg",
            description: "This is a demo trip shown when the backend endpoint is unavailable.",
          });
        } else {
          const data = await res.json();
          setTrip(data.trip || data);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchTrip();
  }, [tripId]);

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

  const handleDelete = async () => {
    const ok = confirm("Delete this trip?");
    if (!ok) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5001/api/trips/${tripId}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }).catch(() => null);
    if (!res || !res.ok) {
      toast({ title: "Deleted (demo)", description: "Removed trip locally." });
      router.push("/trips");
      return;
    }
    toast({ title: "Trip deleted" });
    router.push("/trips");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-950">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        {loading || !trip ? (
          <div className="py-20 text-center text-slate-500">Loading trip...</div>
        ) : (
          <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {trip.cover ? (
              <div className="aspect-video bg-slate-200 dark:bg-slate-700">
                <img
                  src={trip.cover.startsWith('http') ? trip.cover : `http://localhost:5001${trip.cover}`}
                  alt={trip.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}
            <CardHeader>
              <CardTitle className="text-2xl">{trip.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4" />
                {formatRange(trip.start_date, trip.end_date)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trip.destinations && trip.destinations.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {trip.destinations.map((d) => (
                    <Badge key={d} variant="secondary" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {d}
                    </Badge>
                  ))}
                </div>
              )}

              {trip.description ? (
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-6">{trip.description}</p>
              ) : null}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push(`/trips/${trip.id}/edit`)} className="flex items-center gap-2">
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
