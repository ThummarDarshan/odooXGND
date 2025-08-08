"use client"

import * as React from "react"
import { Bell, Check, Settings, Clock, User, MessageSquare, Heart, Gift, X, ExternalLink, Zap, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"

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

interface NotificationDropdownProps {
  onNotificationChange?: () => void;
}

export function NotificationDropdown({ onNotificationChange }: NotificationDropdownProps) {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [isOpen, setIsOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const { toast } = useToast();

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setNotifications([]);
        return;
      }

      const res = await fetch("http://localhost:5001/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        // Transform backend data to match frontend format
        const transformedNotifications = data.notifications.map((notification: any) => ({
          id: notification.id.toString(),
          type: notification.type,
          title: notification.title,
          message: notification.message,
          time: formatTime(notification.created_at),
          read: notification.is_read,
          priority: notification.priority,
          avatar: notification.avatar
        }));
        setNotifications(transformedNotifications);
      } else {
        console.error("Failed to fetch notifications");
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Format time for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  // Fetch notifications when component mounts and when dropdown opens
  React.useEffect(() => {
    fetchNotifications();
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length

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
          title: "All read notifications cleared",
          description: "All read notifications have been cleared.",
        });
      } else {
        console.error("Failed to clear all read notifications:", res.status);
        toast({
          title: "Error",
          description: "Failed to clear all read notifications.",
        });
      }
    } catch (error) {
      console.error("Error clearing all read notifications:", error);
      toast({
        title: "Error",
        description: "Failed to clear all read notifications.",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4 text-white" />
      case "like":
        return <Heart className="h-4 w-4 text-white" />
      case "follow":
        return <User className="h-4 w-4 text-white" />
      case "system":
        return <Settings className="h-4 w-4 text-white" />
      case "promotion":
        return <Gift className="h-4 w-4 text-white" />
      default:
        return <Bell className="h-4 w-4 text-white" />
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

  const getPriorityIndicator = (priority?: string) => {
    if (priority === "high") {
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse shadow-lg" />
      )
    }
    return null
  }

  // Filter notifications to show only the second latest 'Last Login' notification
  const lastLoginNotifications = notifications
    .filter(n => n.title === 'Last Login')
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  const secondLatestLastLogin = lastLoginNotifications[1] || null;

  // Filter out all 'Last Login' notifications
  let filteredNotifications = notifications.filter(n => n.title !== 'Last Login');
  // Add the second latest 'Last Login' notification if it exists
  if (secondLatestLastLogin) filteredNotifications.unshift(secondLatestLastLogin);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-300 rounded-full p-2.5 hover:scale-105"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
              <span className="text-white text-xs font-bold">{unreadCount > 9 ? "9+" : unreadCount}</span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-96 bg-white/95 backdrop-blur-2xl border-0 shadow-2xl rounded-3xl p-0 animate-in slide-in-from-top-4 duration-500 overflow-hidden"
      >
        {/* Premium Header */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Notifications</h3>
                <p className="text-white/80 text-sm">Stay in the loop</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                <span className="text-white text-sm font-semibold">{unreadCount} new</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                setLoading(true);
                const token = localStorage.getItem("token");
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
                  if (!res.ok) {
                    let errorMsg = "Failed to mark all notifications as read.";
                    if (res.status === 401) {
                      errorMsg = "Session expired. Please log in again.";
                      window.location.href = "/login";
                    } else {
                      try {
                        const errData = await res.json();
                        if (errData && errData.error) errorMsg = errData.error;
                      } catch {}
                    }
                    toast({ title: "Error", description: errorMsg });
                    throw new Error(errorMsg);
                  }
                  setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                  if (onNotificationChange) onNotificationChange();
                  toast({ title: "All notifications marked as read", description: "All notifications have been marked as read." });
                } catch (err) {
                  // Already handled above
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || unreadCount === 0}
              className="text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105"
            >
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                setLoading(true);
                const token = localStorage.getItem("token");
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
                  if (!res.ok) {
                    let errorMsg = "Failed to clear all read notifications.";
                    if (res.status === 401) {
                      errorMsg = "Session expired. Please log in again.";
                      window.location.href = "/login";
                    } else {
                      try {
                        const errData = await res.json();
                        if (errData && errData.error) errorMsg = errData.error;
                      } catch {}
                    }
                    toast({ title: "Error", description: errorMsg });
                    throw new Error(errorMsg);
                  }
                  setNotifications((prev) => prev.filter((n) => !n.read));
                  if (onNotificationChange) onNotificationChange();
                  toast({ title: "All read notifications cleared", description: "All read notifications have been cleared." });
                } catch (err) {
                  // Already handled above
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || notifications.filter(n => n.read).length === 0}
              className="text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear all read
            </Button>
          </div>
        </div>

        {/* Enhanced Notifications List */}
        <ScrollArea className="h-96">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl mb-4 shadow-inner">
                <Bell className="h-10 w-10 text-slate-400" />
              </div>
              <h4 className="font-semibold text-slate-700 mb-2">Loading notifications...</h4>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                Please wait while we fetch your notifications.
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl mb-4 shadow-inner">
                <Bell className="h-10 w-10 text-slate-400" />
              </div>
              <h4 className="font-semibold text-slate-700 mb-2">All caught up!</h4>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                No new notifications right now. We'll notify you when something exciting happens.
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {filteredNotifications.map((notification: Notification, index: number) => (
                <div
                  key={notification.id}
                  className={`group relative p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                    !notification.read
                      ? "bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-pink-50/80 border border-blue-200/50 shadow-md hover:shadow-lg"
                      : "bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/50 hover:shadow-md"
                  } animate-in slide-in-from-left-4 duration-500 backdrop-blur-sm`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start space-x-4">
                    {/* Enhanced Icon/Avatar */}
                    <div className="flex-shrink-0 relative">
                      {notification.avatar ? (
                        <div className="relative">
                          <img
                            src={notification.avatar || "/placeholder.svg"}
                            alt=""
                            className="h-11 w-11 rounded-2xl object-cover ring-2 ring-white shadow-lg"
                          />
                          <div
                            className={`absolute -bottom-1 -right-1 p-1.5 rounded-xl shadow-lg ${getIconBackground(notification.type)}`}
                          >
                            {getNotificationIcon(notification.type)}
                          </div>
                          {getPriorityIndicator(notification.priority)}
                        </div>
                      ) : (
                        <div className="relative">
                          <div
                            className={`h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg ${getIconBackground(notification.type)}`}
                          >
                            {getNotificationIcon(notification.type)}
                          </div>
                          {getPriorityIndicator(notification.priority)}
                        </div>
                      )}

                      {!notification.read && (
                        <div className="absolute -top-1 -left-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-lg" />
                      )}
                    </div>

                    {/* Enhanced Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4
                              className={`font-semibold text-sm ${
                                !notification.read ? "text-slate-900" : "text-slate-700"
                              }`}
                            >
                              {notification.title}
                            </h4>
                            {notification.priority === "high" && (
                              <div className="flex items-center">
                                <Zap className="h-3 w-3 text-orange-500" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mb-2 leading-relaxed line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1 text-xs text-slate-500">
                                <Clock className="h-3 w-3" />
                                <span className="font-medium">{notification.time}</span>
                              </div>
                              {!notification.read && (
                                <Badge
                                  variant="secondary"
                                  className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium border-0"
                                >
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Action buttons */}
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-3">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                              className="h-7 w-7 p-0 hover:bg-emerald-100 hover:text-emerald-600 rounded-xl transition-all duration-200 hover:scale-110"
                              title="Mark as read"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600 rounded-xl transition-all duration-200 hover:scale-110"
                            title="Delete"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Premium Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent mx-4" />
            <div className="p-4 bg-gradient-to-r from-slate-50/80 to-slate-100/80 backdrop-blur-sm flex flex-col gap-2">
              <Button
                variant="ghost"
                className="w-full text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white/70 backdrop-blur-sm rounded-2xl py-3 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center space-x-2 border border-slate-200/50"
                asChild
              >
                <a href="/notifications">
                  <ExternalLink className="h-4 w-4" />
                  <span>View all notifications</span>
                </a>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
