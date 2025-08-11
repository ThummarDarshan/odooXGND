"use client"

import * as React from "react"
import {
  Bell,
  Check,
  Settings,
  Clock,
  User,
  MessageSquare,
  Heart,
  Gift,
  X,
  Search,
  ArrowLeft,
  Trash2,
  Filter,
  Zap,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "./navigation"
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string
  type: "message" | "like" | "follow" | "system" | "promotion"
  title: string
  message: string
  time: string
  read: boolean
  avatar?: string
  priority?: "high" | "medium" | "low"
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "message",
    title: "Sarah Johnson sent you a message",
    message:
      "Hey! I wanted to discuss the new project requirements with you. Could we schedule a meeting for tomorrow? I have some exciting ideas to share.",
    time: "2 minutes ago",
    read: false,
    avatar: "/placeholder-user.jpg",
    priority: "high",
  },
  {
    id: "2",
    type: "like",
    title: "Your post is trending!",
    message:
      "Alex Chen, Maria Rodriguez and 47 others loved your recent post about modern web development best practices. It's gaining lots of traction!",
    time: "15 minutes ago",
    read: false,
    priority: "high",
  },
  {
    id: "3",
    type: "follow",
    title: "Emma Wilson started following you",
    message:
      "Emma Wilson started following you. She's a Senior UX Designer at TechCorp with 8 years of experience in product design.",
    time: "1 hour ago",
    read: true,
    avatar: "/placeholder-user.jpg",
    priority: "medium",
  },
  {
    id: "4",
    type: "system",
    title: "Security update completed",
    message:
      "Your account security settings have been updated successfully. Two-factor authentication is now enabled and your account is more secure.",
    time: "2 hours ago",
    read: true,
    priority: "high",
  },
  {
    id: "5",
    type: "promotion",
    title: "Limited time offer - 50% off Pro Plan",
    message:
              "Upgrade to GlobeTrotter Pro today and get 50% off for the first 3 months! This exclusive offer expires in 24 hours. Don't miss out!",
    time: "1 day ago",
    read: false,
    priority: "high",
  },
  {
    id: "6",
    type: "message",
    title: "Team mention in #design-team",
    message:
      "You were mentioned by John Doe in the design team channel: '@user great work on the new dashboard mockup! The user flow is really intuitive.'",
    time: "1 day ago",
    read: true,
    priority: "medium",
  },
  {
    id: "7",
    type: "like",
    title: "Comment appreciation",
    message:
      "Maria Rodriguez and 8 others liked your thoughtful comment on the UI/UX discussion thread about responsive design patterns and mobile-first approach.",
    time: "2 days ago",
    read: true,
    priority: "low",
  },
  {
    id: "8",
    type: "system",
    title: "Weekly activity report is ready",
    message:
      "Your weekly activity report is now available for review. You've completed 15 tasks, received 23 likes, and gained 5 new followers this week.",
    time: "3 days ago",
    read: false,
    priority: "medium",
  },
  {
    id: "9",
    type: "follow",
    title: "Connection request from David Kim",
    message:
      "David Kim sent you a connection request. He's a Product Manager at StartupXYZ and you have 12 mutual connections including Sarah Johnson.",
    time: "4 days ago",
    read: true,
    priority: "medium",
  },
  {
    id: "10",
    type: "promotion",
    title: "New collaboration features released",
    message:
      "We've just released our new collaboration tools! Try the real-time editing feature, enhanced team workspace, and improved file sharing capabilities.",
    time: "1 week ago",
    read: true,
    priority: "medium",
  },
]

export function NotificationsPage({ notifications: propNotifications, onNotificationChange }: { notifications?: any[], onNotificationChange?: () => void }) {
  const [notifications, setNotifications] = React.useState<Notification[]>(propNotifications || mockNotifications)
  const [selectedTab, setSelectedTab] = React.useState("all")
  const [searchTerm, setSearchTerm] = React.useState("")
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const createSampleNotifications = async () => {
    if (loading) return; // Prevent multiple clicks
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Error",
          description: "No authentication token found.",
        });
        return;
      }

      const res = await fetch("http://localhost:5001/api/notifications/sample", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast({
          title: "Sample notifications created!",
          description: "Refresh the page to see your new notifications.",
        });
        // Notify parent component about the change
        if (onNotificationChange) {
          onNotificationChange();
        }
        // Refresh notifications by calling the parent callback
        if (onNotificationChange) {
          onNotificationChange();
        }
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create sample notifications");
      }
    } catch (err: any) {
      toast({
        title: "Error creating sample notifications",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length
  const highPriorityCount = notifications.filter((n) => n.priority === "high" && !n.read).length

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`http://localhost:5001/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
        );
        // Notify parent component about the change
        if (onNotificationChange) {
          onNotificationChange();
        }
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`http://localhost:5001/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id));
        // Notify parent component about the change
        if (onNotificationChange) {
          onNotificationChange();
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const deleteAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5001/api/notifications/delete-read", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setNotifications((prev) => prev.filter((notification) => !notification.read));
        // Notify parent component about the change
        if (onNotificationChange) {
          onNotificationChange();
        }
        toast({
          title: "Read notifications cleared",
          description: "All read notifications have been deleted.",
        });
      }
    } catch (error) {
      console.error("Error deleting read notifications:", error);
      toast({
        title: "Error",
        description: "Failed to delete read notifications.",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-5 w-5 text-white" />
      case "like":
        return <Heart className="h-5 w-5 text-white" />
      case "follow":
        return <User className="h-5 w-5 text-white" />
      case "system":
        return <Settings className="h-5 w-5 text-white" />
      case "promotion":
        return <Gift className="h-5 w-5 text-white" />
      default:
        return <Bell className="h-5 w-5 text-white" />
    }
  }

  const getIconBackground = (type: string) => {
    switch (type) {
      case "message":
        return "bg-gradient-to-br from-blue-500 to-blue-600"
      case "like":
        return "bg-gradient-to-br from-pink-500 to-rose-600"
      case "follow":
        return "bg-gradient-to-br from-emerald-500 to-green-600"
      case "system":
        return "bg-gradient-to-br from-slate-500 to-slate-600"
      case "promotion":
        return "bg-gradient-to-br from-purple-500 to-violet-600"
      default:
        return "bg-gradient-to-br from-slate-500 to-slate-600"
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())

    if (selectedTab === "all") return matchesSearch
    if (selectedTab === "unread") return matchesSearch && !notification.read
    return matchesSearch && notification.type === selectedTab
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Header */}
        <div className="bg-background/80 backdrop-blur-xl rounded-3xl shadow-xl border border-background/20 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-muted p-3 rounded-2xl transition-all duration-300 hover:scale-105"
                asChild
              >
                <a href="/">
                  <ArrowLeft className="h-5 w-5" />
                </a>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-lg">
                    <Bell className="h-7 w-7 text-white" />
                  </div>
                  <span>Notifications</span>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 text-sm font-semibold">
                        {unreadCount} new
                      </Badge>
                    )}
                    {highPriorityCount > 0 && (
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 text-sm font-semibold flex items-center space-x-1">
                        <Zap className="h-3 w-3" />
                        <span>{highPriorityCount} urgent</span>
                      </Badge>
                    )}
                  </div>
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                  Stay updated with your latest activity and important updates
                </p>
              </div>
            </div>

            {/* Remove Mark all read and Clear read buttons from the notifications page */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  setLoading(true);
                  const token = localStorage.getItem("token");
                  console.log("Notification token:", token);
                  if (!token) {
                    toast({ title: "Not logged in", description: "Please log in to use notifications." });
                    window.location.href = "/login";
                    setLoading(false);
                    return;
                  }
                  try {
                    const res = await fetch("http://localhost:5001/api/notifications/read-all", {
                      method: "PUT",
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    if (!res.ok) throw new Error("Failed to mark all as read");
                    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                    if (onNotificationChange) onNotificationChange();
                    toast({ title: "All notifications marked as read", description: "All notifications have been marked as read." });
                  } catch (err) {
                    toast({ title: "Error", description: "Failed to mark all notifications as read." });
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || unreadCount === 0}
                className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-background/70 backdrop-blur-sm px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
              >
                <Check className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  setLoading(true);
                  const token = localStorage.getItem("token");
                  console.log("Notification token:", token);
                  if (!token) {
                    toast({ title: "Not logged in", description: "Please log in to use notifications." });
                    window.location.href = "/login";
                    setLoading(false);
                    return;
                  }
                  try {
                    const res = await fetch("http://localhost:5001/api/notifications/delete-read", {
                      method: "DELETE",
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) throw new Error("Failed to clear all read");
                    setNotifications((prev) => prev.filter((n) => !n.read));
                    if (onNotificationChange) onNotificationChange();
                    toast({ title: "All read notifications cleared", description: "All read notifications have been cleared." });
                  } catch (err) {
                    toast({ title: "Error", description: "Failed to clear all read notifications." });
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || notifications.filter(n => n.read).length === 0}
                className="text-red-600 border-red-200 hover:bg-red-50 bg-background/70 backdrop-blur-sm px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear read
              </Button>
            </div>
          </div>

          {/* Enhanced Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-background focus:bg-background focus:border-blue-300 focus:ring-blue-200 rounded-2xl text-base"
              />
            </div>
            <Button
              variant="outline"
              className="px-6 py-3 bg-background focus:bg-background rounded-2xl font-medium transition-all duration-300 hover:scale-105"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
          <div className="bg-background/80 backdrop-blur-xl rounded-3xl shadow-xl border border-background/20 overflow-hidden">
            <TabsList className="w-full justify-start bg-muted/80 border-b border-border/50 rounded-none p-2">
              <TabsTrigger value="all" className="px-6 py-3 rounded-2xl font-medium transition-all duration-300">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread" className="px-6 py-3 rounded-2xl font-medium transition-all duration-300">
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="message" className="px-6 py-3 rounded-2xl font-medium transition-all duration-300">
                Messages
              </TabsTrigger>
              <TabsTrigger value="like" className="px-6 py-3 rounded-2xl font-medium transition-all duration-300">
                Likes
              </TabsTrigger>
              <TabsTrigger value="follow" className="px-6 py-3 rounded-2xl font-medium transition-all duration-300">
                Follows
              </TabsTrigger>
              <TabsTrigger value="system" className="px-6 py-3 rounded-2xl font-medium transition-all duration-300">
                System
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="m-0">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="p-8 bg-muted rounded-3xl mb-6 shadow-inner">
                    <Bell className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-muted-foreground mb-3 text-xl">No notifications found</h3>
                  <p className="text-xs text-muted-foreground mt-4">
                    {searchTerm
                      ? "Try adjusting your search terms or check different categories"
                      : "You're all caught up! Check back later for new updates and activities."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-muted/50">
                  {filteredNotifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`group p-8 transition-all duration-300 hover:bg-slate-50/50 cursor-pointer ${
                        !notification.read
                          ? "bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-pink-50/50 border-l-4 border-gradient-to-b from-blue-500 to-purple-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-start space-x-6">
                        {/* Premium Icon/Avatar */}
                        <div className="flex-shrink-0 relative">
                          {notification.avatar ? (
                            <div className="relative">
                              <img
                                src={notification.avatar || "/placeholder.svg"}
                                alt=""
                                className="h-14 w-14 rounded-2xl object-cover ring-3 ring-white shadow-xl"
                              />
                              <div
                                className={`absolute -bottom-2 -right-2 p-2 rounded-xl shadow-xl ${getIconBackground(notification.type)}`}
                              >
                                {getNotificationIcon(notification.type)}
                              </div>
                              {notification.priority === "high" && (
                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse shadow-lg" />
                              )}
                            </div>
                          ) : (
                            <div className="relative">
                              <div
                                className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-xl ${getIconBackground(notification.type)}`}
                              >
                                {getNotificationIcon(notification.type)}
                              </div>
                              {notification.priority === "high" && (
                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse shadow-lg" />
                              )}
                            </div>
                          )}

                          {!notification.read && (
                            <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-lg" />
                          )}
                        </div>

                        {/* Premium Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3
                                  className={`font-bold text-lg ${
                                    !notification.read ? "text-foreground" : "text-muted-foreground"
                                  }`}
                                >
                                  {notification.title}
                                </h3>
                                {notification.priority === "high" && (
                                  <div className="flex items-center space-x-1 bg-gradient-to-r from-orange-100 to-red-100 px-2 py-1 rounded-full">
                                    <Zap className="h-3 w-3 text-orange-600" />
                                    <span className="text-xs font-semibold text-orange-700">Urgent</span>
                                  </div>
                                )}
                                {notification.type === "like" && notification.message.includes("trending") && (
                                  <div className="flex items-center space-x-1 bg-gradient-to-r from-pink-100 to-rose-100 px-2 py-1 rounded-full">
                                    <TrendingUp className="h-3 w-3 text-pink-600" />
                                    <span className="text-xs font-semibold text-pink-700">Trending</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-muted-foreground mb-4 leading-relaxed text-base">{notification.message}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-medium">{notification.time}</span>
                                  </div>
                                  {!notification.read && (
                                    <Badge
                                      variant="secondary"
                                      className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm px-3 py-1 rounded-full font-semibold border-0"
                                    >
                                      New
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Premium Action buttons */}
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-6">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-10 w-10 p-0 hover:bg-emerald-100 hover:text-emerald-600 rounded-2xl transition-all duration-300 hover:scale-110"
                                  title="Mark as read"
                                >
                                  <Check className="h-5 w-5" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-10 w-10 p-0 hover:bg-red-100 hover:text-red-600 rounded-2xl transition-all duration-300 hover:scale-110"
                                title="Delete notification"
                              >
                                <X className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
