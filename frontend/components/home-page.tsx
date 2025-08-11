"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, SortAsc, MapPin, Calendar, Plane, Plus, User, SlidersHorizontal, Layers } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Traveler");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    const name = localStorage.getItem('userName');
    if (name) setUserName(name);
  }, []);

  const handlePlanTrip = () => {
    if (isLoggedIn) {
      router.push('/trips/create');
    } else {
      router.push('/login');
    }
  };

  // Mock data
  const regionalSelections = [
    { id: 1, name: "Paris, France", image: "/placeholder.jpg", rating: 4.8 },
    { id: 2, name: "Tokyo, Japan", image: "/placeholder.jpg", rating: 4.9 },
    { id: 3, name: "New York, USA", image: "/placeholder.jpg", rating: 4.7 },
    { id: 4, name: "London, UK", image: "/placeholder.jpg", rating: 4.6 },
    { id: 5, name: "Rome, Italy", image: "/placeholder.jpg", rating: 4.8 }
  ];
  const previousTrips = [
    { id: 1, title: "Paris Adventure", date: "March 2024", destination: "Paris, France", image: "/placeholder.jpg" },
    { id: 2, title: "Tokyo Exploration", date: "February 2024", destination: "Tokyo, Japan", image: "/placeholder.jpg" },
    { id: 3, title: "London Trip", date: "January 2024", destination: "London, UK", image: "/placeholder.jpg" }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-950">
      <div className="relative z-10 flex flex-col items-center w-full">
        <Navigation />
        {/* Banner Image */}
        <div className="w-full flex justify-center mt-8">
          <div className="relative w-full max-w-6xl h-56 md:h-72 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-xl flex items-center justify-center overflow-hidden animate-fade-in">
            <img src="/globetrotter-logo.png" alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 flex flex-col items-center justify-center w-full">
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-2 animate-slide-down text-center">Banner Image</h1>
              <p className="text-lg md:text-xl text-white/90 mb-4 animate-fade-in text-center">Welcome to GlobalTrotter</p>
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
                  className="bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-shadow cursor-pointer group animate-fade-in flex flex-col justify-between"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <CardContent className="p-3 flex flex-col items-center">
                    <div className="aspect-square w-full bg-slate-200 dark:bg-slate-700 rounded-lg mb-2 overflow-hidden">
                      <img 
                        src={region.image} 
                        alt={region.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {previousTrips.map((trip, idx) => (
                <Card
                  key={trip.id}
                  className="bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-shadow cursor-pointer group animate-fade-in flex flex-col justify-between"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="aspect-[3/4] bg-slate-200 dark:bg-slate-700 overflow-hidden rounded-t-xl">
                    <img 
                      src={trip.image} 
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg mb-2">{trip.title}</h3>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{trip.date}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Plan a Trip Button */}
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end animate-fade-in">
          <Button 
            size="lg" 
            onClick={handlePlanTrip}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 rounded-full w-16 h-16 p-0 flex items-center justify-center"
          >
            <Plus className="h-8 w-8" />
          </Button>
          <div className="mt-2 bg-white dark:bg-slate-800 text-xs font-medium px-3 py-1 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 whitespace-nowrap animate-slide-up">
            Plan a trip
          </div>
        </div>
      </div>
      {/* Animations */}
      <style jsx global>{`
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
