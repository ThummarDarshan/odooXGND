"use client"

import * as React from "react"
import { Search, LogIn, UserPlus, Menu, Home, Info, User, Bell, Shield, Settings, History, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { NotificationDropdown } from "./notification-dropdown"
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Logo } from "@/components/ui/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation";

export function Navigation() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [notificationKey, setNotificationKey] = React.useState(0)
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [userAvatar, setUserAvatar] = React.useState<string | null>(null);
  const [userInitials, setUserInitials] = React.useState<string>('');
  const [hasMounted, setHasMounted] = React.useState(false);
  const router = useRouter();

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const responseData = await response.json();
        const userData = responseData.user || responseData;
        setUserAvatar(userData.avatar || '');
        setUserRole(userData.role || null); // Always use backend role
        const firstName = userData.first_name || '';
        const lastName = userData.last_name || '';
        const initials = `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase();
        setUserInitials(initials || 'U');
      } else {
        setUserAvatar('');
        setUserRole(null);
        setUserInitials('U');
      }
    } catch (error) {
      setUserAvatar('');
      setUserRole(null);
      setUserInitials('U');
    }
  };

  React.useEffect(() => {
    setHasMounted(true);
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) {
      fetchUserProfile(token); // Only fetch from backend
    }
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'avatarUpdated') {
        const token = localStorage.getItem('token');
        if (token) fetchUserProfile(token);
      }
      if (event.key === 'token' || event.key === 'user') {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        if (token) fetchUserProfile(token);
        else {
          setUserRole(null);
          setUserAvatar(null);
          setUserInitials('');
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    router.push('/');
  };

  const handleProfileAction = (action: string) => {
    switch (action) {
      case 'profile':
        router.push('/profile');
        break;
      case 'activity':
        router.push('/activity-history'); // Changed from /notifications
        break;
      case 'settings':
        router.push('/settings');
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  // Force re-render of notification dropdown when notifications change
  const handleNotificationChange = () => {
    setNotificationKey(prev => prev + 1);
  };

  // Avatar URL logic (match profile page)
  const backendUrl = "http://localhost:5001";
  const avatarSrc = userAvatar && userAvatar.startsWith("/uploads/")
    ? backendUrl + userAvatar
    : userAvatar || "https://github.com/shadcn.png";

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="hover:opacity-80 transition-opacity duration-300">
              <Logo size="md" />
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {hasMounted && isLoggedIn && userRole === 'admin' && (
              <a
                href="/admin"
                className="text-foreground hover:text-foreground/80 font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </a>
            )}
            {/* Itinerary Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-foreground hover:text-blue-600 font-medium transition-colors duration-200 focus:outline-none">
                <History className="h-4 w-4" />
                <span>Itinerary</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50">
                <a
                  href="/trips/itinerary-builder"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-t-lg"
                >
                  Build Itinerary
                </a>
                <a
                  href="/trips/itinerary-view"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-b-lg"
                >
                  View Itinerary
                </a>
              </div>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <NotificationDropdown key={notificationKey} onNotificationChange={handleNotificationChange} />
            {/* Profile Icon with Dropdown */}
            {hasMounted ? (
              isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center justify-center rounded-full p-1 hover:bg-muted transition-colors"
                      title="Profile"
                      type="button"
                    >
                      <Avatar className="w-8 h-8">
                      <AvatarImage 
                        src={avatarSrc} 
                        alt="Profile"
                      />
                        <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
                          {userInitials || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleProfileAction('profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleProfileAction('activity')}>
                      <History className="mr-2 h-4 w-4" />
                      Activity History
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleProfileAction('settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/trips')}>
                      <History className="mr-2 h-4 w-4" />
                      My Trips
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleProfileAction('logout')} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  className="flex items-center justify-center rounded-full p-2 hover:bg-muted transition-colors"
                  title="Login"
                  type="button"
                >
                  <User className="h-5 w-5 text-foreground hover:text-blue-600" />
                </button>
              )
            ) : null}
            
            {hasMounted ? (
              isLoggedIn ? null : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-foreground border-border hover:bg-muted hover:text-foreground hover:border-border transition-all duration-200 px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-3 md:py-2 lg:px-4 lg:py-2 rounded-lg font-medium bg-background shadow-sm hover:shadow-md whitespace-nowrap min-w-fit"
                    asChild
                  >
                    <a href="/login" className="flex items-center space-x-1.5">
                      <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium">Login</span>
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-3 md:py-2 lg:px-4 lg:py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 whitespace-nowrap min-w-fit"
                    asChild
                  >
                    <a href="/signup" className="flex items-center space-x-1.5">
                      <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium">Sign Up</span>
                    </a>
                  </Button>
                </>
              )
            ): null}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-background/95 backdrop-blur-xl">
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Mobile Navigation Links */}
                  <div className="flex flex-col space-y-3">
                    {hasMounted && isLoggedIn && userRole === 'admin' && (
                      <a
                        href="/admin"
                        className="flex items-center space-x-3 text-foreground hover:text-foreground/80 font-medium transition-colors duration-200 p-3 rounded-lg hover:bg-muted"
                        onClick={() => setIsOpen(false)}
                      >
                        <Shield className="h-5 w-5" />
                        <span>Admin</span>
                      </a>
                    )}
                    {/* Itinerary Dropdown for Mobile */}
                    <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="flex items-center px-3 py-2 font-medium text-foreground bg-gray-50 border-b border-gray-200">
                        <History className="h-5 w-5 mr-2" />
                        Itinerary
                      </div>
                      <a
                        href="/trips/itinerary-builder"
                        className="px-6 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-b border-gray-100"
                        onClick={() => setIsOpen(false)}
                      >
                        Build Itinerary
                      </a>
                      <a
                        href="/trips/itinerary-view"
                        className="px-6 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => setIsOpen(false)}
                      >
                        View Itinerary
                      </a>
                    </div>
                    <a
                      href="/notifications"
                      className="flex items-center space-x-3 text-foreground hover:text-foreground/80 font-medium transition-colors duration-200 p-3 rounded-lg hover:bg-muted"
                      onClick={() => setIsOpen(false)}
                    >
                      <Bell className="h-5 w-5" />
                      <span>Notifications</span>
                    </a>
                  </div>

                  {/* Mobile Notification */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium text-foreground">Notifications</span>
                    <NotificationDropdown key={notificationKey} onNotificationChange={handleNotificationChange} />
                  </div>

                  {/* Mobile Auth Buttons */}
                  <div className="flex flex-col space-y-3 pt-4 border-t border-border">
                    {hasMounted ? (
                      isLoggedIn ? (
                        <>
                  <Button
                    variant="outline"
                    className="w-full text-foreground border-border hover:bg-muted hover:text-foreground hover:border-border transition-all duration-200 px-4 py-3 rounded-lg font-medium bg-background shadow-sm hover:shadow-md"
                    onClick={() => { router.push('/profile'); setIsOpen(false); }}
                  >
                    <Avatar className="w-4 h-4 mr-3">
                      <AvatarImage 
                        src={avatarSrc} 
                        alt="Profile"
                      />
                      <AvatarFallback className="bg-blue-500 text-white text-xs">
                        {userInitials || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    Profile
                  </Button>
                          <Button
                            variant="outline"
                            className="w-full text-foreground border-border hover:bg-muted hover:text-foreground hover:border-border transition-all duration-200 px-4 py-3 rounded-lg font-medium bg-background shadow-sm hover:shadow-md"
                            onClick={() => { router.push('/activity-history'); setIsOpen(false); }}
                          >
                            <History className="mr-3 h-4 w-4" />
                            Activity History
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full text-foreground border-border hover:bg-muted hover:text-foreground hover:border-border transition-all duration-200 px-4 py-3 rounded-lg font-medium bg-background shadow-sm hover:shadow-md"
                            onClick={() => { router.push('/settings'); setIsOpen(false); }}
                          >
                            <Settings className="mr-3 h-4 w-4" />
                            Settings
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all duration-200 px-4 py-3 rounded-lg font-medium bg-background shadow-sm hover:shadow-md"
                            onClick={() => { handleLogout(); setIsOpen(false); }}
                          >
                            <LogOut className="mr-3 h-4 w-4" />
                            Logout
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            className="w-full text-foreground border-border hover:bg-muted hover:text-foreground hover:border-border transition-all duration-200 px-4 py-3 rounded-lg font-medium bg-background shadow-sm hover:shadow-md"
                            asChild
                          >
                            <a href="/login" className="flex items-center justify-center space-x-3">
                              <LogIn className="h-4 w-4" />
                              <span>Login</span>
                            </a>
                          </Button>
                          <Button
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
                            asChild
                          >
                            <a href="/signup" className="flex items-center justify-center space-x-3">
                              <UserPlus className="h-4 w-4" />
                              <span>Sign Up</span>
                            </a>
                          </Button>
                        </>
                      )
                    ) : null}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-muted-foreground">🌞</span>
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle dark mode"
      />
      <span className="text-xs text-muted-foreground">🌙</span>
    </div>
  );
}
