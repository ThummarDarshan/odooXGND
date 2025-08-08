"use client"
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { NotificationsPage } from "../../components/notifications-page"

interface Notification {
  id: string;
  type: "message" | "like" | "follow" | "system" | "promotion";
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatar?: string;
  priority?: "high" | "medium" | "low";
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  // Transform backend data to match frontend format
  const transformNotifications = (backendNotifications: any[]): Notification[] => {
    return backendNotifications.map((notification: any) => ({
      id: notification.id.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      time: formatTime(notification.created_at),
      read: notification.is_read,
      priority: notification.priority,
      avatar: notification.avatar
    }));
  };

  // Format time for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Handle notification changes from child components
  const handleNotificationChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }
        
        const res = await fetch("http://localhost:5001/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch notifications");
        }
        
        const data = await res.json();
        const transformedNotifications = transformNotifications(data.notifications);
        setNotifications(transformedNotifications);
      } catch (err: any) {
        console.error("Notifications fetch error:", err);
        setError(err.message);
        toast({
          title: "Error loading notifications",
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [toast, refreshKey]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notifications...</p>
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
              fetchNotifications();
            }} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <NotificationsPage notifications={notifications} onNotificationChange={handleNotificationChange} />;
}
