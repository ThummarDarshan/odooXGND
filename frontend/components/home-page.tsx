"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, SortAsc, MapPin, Calendar, Plane, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handlePlanTrip = () => {
    if (isLoggedIn) {
      router.push('/trips/create');
    } else {
      router.push('/login');
    }
  };

  // Mock data for regional selections and previous trips
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
      {/* Content */}
      <div className="relative z-10">
        <Navigation />
        
        {/* Banner Image Section */}
        <div className="relative w-full h-96 md:h-[500px] bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center text-white z-10">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Discover Your Next Adventure</h1>
              <p className="text-xl md:text-2xl opacity-90">Explore the world with GlobalTrotter</p>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full"></div>
        </div>

        {/* Search and Filtering Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search destinations, hotels, activities..."
                  className="pl-10 pr-4 py-3 text-lg border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-900"
                />
              </div>
              
              {/* Filter Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Group by
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <SortAsc className="h-4 w-4" />
                  Sort by...
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Top Regional Selections */}
          <section className="mb-16">
            <div className="flex items-center mb-8">
              <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600"></div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 px-6">
                Top Regional Selections
              </h2>
              <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600"></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {regionalSelections.map((region) => (
                <Card key={region.id} className="bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-lg mb-3 overflow-hidden">
                      <img 
                        src={region.image} 
                        alt={region.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">{region.name}</h3>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{region.rating}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Previous Trips */}
          <section className="mb-16">
            <div className="flex items-center mb-8">
              <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600"></div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 px-6">
                Previous Trips
              </h2>
              <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {previousTrips.map((trip) => (
                <Card key={trip.id} className="bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow cursor-pointer group">
                  <div className="aspect-video bg-slate-200 dark:bg-slate-700 overflow-hidden">
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
          </section>
        </div>

        {/* Plan a Trip Button - Fixed Position */}
        <div className="fixed bottom-8 right-8 z-50">
          <Button 
            size="lg" 
            onClick={handlePlanTrip}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 rounded-full w-16 h-16 p-0"
          >
            <Plus className="h-8 w-8" />
          </Button>
          <div className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 text-xs font-medium px-2 py-1 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 whitespace-nowrap">
            Plan a trip
          </div>
        </div>
      </div>
    </div>
  )
}
