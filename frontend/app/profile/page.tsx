"use client"
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Profile from './Profile';
import { apiRequest } from "@/lib/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [activityHistory, setActivityHistory] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfileAndTrips = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }
        // Fetch profile
        const res = await fetch("http://localhost:5001/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch profile");
        }
        const data = await res.json();
        setProfile(data.user);
        // Fetch trips
        const userId = data.user?.id;
        let tripsData = [];
        if (userId) {
          const tripRes = await apiRequest(`/trips/user/${userId}`);
          tripsData = Array.isArray(tripRes.trips) ? tripRes.trips : tripRes;
        }
        setTrips(tripsData);
        // Fetch activity history (notifications)
        const notifRes = await fetch("http://localhost:5001/api/notifications?limit=20", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setActivityHistory(notifData.notifications);
        } else {
          setActivityHistory([]);
        }
      } catch (err: any) {
        console.error("Profile fetch error:", err);
        setError(err.message);
        toast({
          title: "Error loading profile",
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndTrips();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              // re-fetch
              window.location.reload();
            }} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Split trips into preplanned (future) and previous (past)
  const now = new Date();
  const preplannedTrips = trips.filter((trip: any) => new Date(trip.start_date) > now);
  const previousTrips = trips.filter((trip: any) => new Date(trip.end_date) < now);

  return <Profile profile={profile} activityHistory={activityHistory} preplannedTrips={preplannedTrips} previousTrips={previousTrips} />;
}