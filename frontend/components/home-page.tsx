"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Search, Filter, SortAsc, MapPin, Calendar, Plane, Plus, User, SlidersHorizontal, Layers, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { apiRequest } from "@/lib/api";
import { regionalSelectionImages } from "./regionalSelectionImages";

export function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Traveler");
  const [search, setSearch] = useState("");
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    const name = localStorage.getItem('userName');
    if (name) setUserName(name);
    // Fetch all trips for the user (or all users if admin/global)
    async function fetchTrips() {
      setLoading(true);
      try {
        let userId;
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userId = payload?.id || payload?.user_id || payload?.userId;
          } catch {}
        }
        let data = [];
        if (userId) {
          const res = await apiRequest(`/trips/user/${userId}`);
          data = Array.isArray(res.trips) ? res.trips : res;
        }
        setTrips(data);
      } catch {
        setTrips([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, []);

  // Filter for previous trips (end_date < now)
  const now = new Date();
  const previousTrips = trips.filter((trip: any) => new Date(trip.end_date) < now);

  const handlePlanTrip = () => {
    if (isLoggedIn) {
      router.push('/trips/create');
    } else {
      router.push('/login');
    }
  };

  // Mock data
  const regionalSelections = [
    { id: 1, name: "Paris, France", image: regionalSelectionImages[0], rating: 4.8 },
    { id: 2, name: "Tokyo, Japan", image: regionalSelectionImages[1], rating: 4.9 },
    { id: 3, name: "New York, USA", image: regionalSelectionImages[2], rating: 4.7 },
    { id: 4, name: "London, UK", image: regionalSelectionImages[3], rating: 4.6 },
    { id: 5, name: "Rome, Italy", image: regionalSelectionImages[4], rating: 4.8 }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-950 font-sans">
      <div className="relative z-10 flex flex-col items-center w-full">
        <Navigation />
        {/* Banner Image */}
        <div className="w-full flex justify-center mt-8">
          <div className="relative w-full max-w-6xl h-56 md:h-72 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden animate-fade-in">
            <img src="/banner.jpg" alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-white/10 backdrop-blur-md" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}} />
            <div className="relative z-10 flex flex-col items-center justify-center w-full">
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-2 animate-slide-down text-center tracking-tight font-sans">Welcome to GlobalTrotter</h1>
              <p className="text-lg md:text-xl text-white/90 mb-2 animate-fade-in text-center font-medium font-sans">Your next adventure starts here</p>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="w-full flex justify-center mt-6">
          <div className="w-full max-w-6xl flex flex-col md:flex-row items-center gap-4 animate-fade-in">
            <div className="relative flex-1 w-full">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="h-6 w-6" />
              </span>
              <Input
                className="pl-14 pr-6 py-4 text-2xl font-normal rounded-full bg-white border border-slate-100 shadow-[0_4px_24px_0_rgba(30,41,59,0.08)] focus:ring-0 focus:border-slate-200 transition-all placeholder:text-slate-500 text-slate-600"
                placeholder="Search bar ..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ boxShadow: '0 4px 24px 0 rgba(30,41,59,0.08)' }}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto justify-end">
              <Button variant="outline" className="flex items-center gap-2 rounded-full px-4 py-2 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900 transition-all animate-pop-in"><Layers className="h-4 w-4" /> Group by</Button>
              <Button variant="outline" className="flex items-center gap-2 rounded-full px-4 py-2 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900 transition-all animate-pop-in"><SlidersHorizontal className="h-4 w-4" /> Filter</Button>
              <Button variant="outline" className="flex items-center gap-2 rounded-full px-4 py-2 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900 transition-all animate-pop-in"><SortAsc className="h-4 w-4" /> Sort by</Button>
            </div>
          </div>
        </div>

        {/* Top Regional Selections */}
        <div className="w-full flex justify-center mt-10">
          <div className="w-full max-w-6xl">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2 animate-fade-in text-left">Top Regional Selections</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {regionalSelections.map((region, idx) => (
                <Card
                  key={region.id}
                  className="bg-white/80 dark:bg-slate-800/80 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-shadow cursor-pointer group animate-fade-in flex flex-col justify-between hover:scale-105 hover:border-blue-400 duration-300"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <CardContent className="p-3 flex flex-col items-center">
                    <div className="aspect-square w-full bg-slate-200 dark:bg-slate-700 rounded-lg mb-2 overflow-hidden">
                      <img 
                        src={region.image} 
                        alt={region.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1 text-center">{region.name}</h3>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">{region.rating}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Previous Trips */}
        <div className="w-full flex justify-center mt-12 mb-24">
          <div className="w-full max-w-6xl">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2 animate-fade-in text-left">Previous Trips</h2>
            {loading ? (
              <div className="py-10 text-center text-slate-400">Loading...</div>
            ) : previousTrips.length === 0 ? (
              <div className="py-10 text-center text-slate-400">No previous trips.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {previousTrips.map((trip: any, idx: number) => (
                  <Card
                    key={trip.id}
                    className="overflow-hidden bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col h-full animate-fade-in"
                    style={{ animationDelay: `${idx * 100}ms` }}
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
                        <Calendar className="h-4 w-4" />
                        {new Date(trip.start_date).toLocaleDateString()} — {new Date(trip.end_date).toLocaleDateString()}
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Floating Plan a Trip Button */}
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end animate-fade-in">
          <Button 
            size="lg" 
            onClick={handlePlanTrip}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 rounded-full w-20 h-20 p-0 flex items-center justify-center border-4 border-white/60 dark:border-slate-900/60"
            style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
          >
            <Plus className="h-8 w-8" />
          </Button>
          <div className="mt-2 bg-white/90 dark:bg-slate-800/90 text-xs font-medium px-4 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 whitespace-nowrap animate-slide-up">
            Plan a trip
          </div>
        </div>
      </div>
      {/* Animations */}
      <style jsx global>{`
        body { background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%); }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: none; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        @keyframes pop-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.7s both; }
        .animate-slide-down { animation: slide-down 0.7s both; }
        .animate-slide-up { animation: slide-up 0.7s both; }
        .animate-pop-in { animation: pop-in 0.5s both; }
      `}</style>
    </div>
  )
}
