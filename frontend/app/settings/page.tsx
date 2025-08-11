"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  Key, 
  Settings as SettingsIcon,
  AlertTriangle,
  Trash2,
  User,
  Bell,
  Palette,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/navigation";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({ title: "Error", description: "All fields are required." });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match." });
      return;
    }
    setIsChangingPassword(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found.");
      const res = await fetch("http://localhost:5001/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      toast({ title: "Password changed!", description: "Your password has been updated." });
      setShowChangePassword(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Error",
          description: "No authentication token found.",
        });
        return;
      }
      const res = await fetch("http://localhost:5001/api/profile/disable", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast({
          title: "Account disabled!",
          description: "Your account has been disabled. Contact support to reactivate.",
        });
        router.push("/");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to disable account");
      }
    } catch (err: any) {
      toast({
        title: "Error disabling account",
        description: err.message,
      });
    }
  };

  const handleNotificationSettings = (type: string, enabled: boolean) => {
    switch (type) {
      case 'general':
        setNotificationsEnabled(enabled);
        break;
      case 'email':
        setEmailNotifications(enabled);
        break;
      case 'push':
        setPushNotifications(enabled);
        break;
    }
    toast({
      title: "Settings updated!",
      description: "Your notification preferences have been saved.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-950 relative overflow-hidden">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center justify-center">
            <SettingsIcon className="mr-3 h-8 w-8 text-blue-500" />
            Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your account preferences and security</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Security Settings */}
          <Card className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-800 dark:text-slate-100">
                <Shield className="mr-2 h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => setShowChangePassword((v) => !v)}
              >
                <Key className="mr-2 h-4 w-4" />
                Change Password
              </Button>
              {showChangePassword && (
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword">Old Password</Label>
                    <Input
                      id="oldPassword"
                      type="password"
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <Button
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? "Changing..." : "Change Password"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowChangePassword(false)}
                      disabled={isChangingPassword}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-800 dark:text-slate-100">
                <Bell className="mr-2 h-5 w-4" />
                Notification Settings
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Control how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-200 font-medium">Enable Notifications</span>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={(checked) => handleNotificationSettings('general', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-200 font-medium">Email Notifications</span>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={(checked) => handleNotificationSettings('email', checked)}
                  disabled={!notificationsEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-200 font-medium">Push Notifications</span>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={(checked) => handleNotificationSettings('push', checked)}
                  disabled={!notificationsEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-800 dark:text-slate-100">
                <Palette className="mr-2 h-5 w-4" />
                Appearance
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Customize your app appearance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeToggle />
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-red-200 dark:border-red-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600 dark:text-red-400">
                <AlertTriangle className="mr-2 h-5 w-4" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showDeleteConfirm ? (
                <Button 
                  className="w-full justify-start bg-red-600 hover:bg-red-700 text-white border-none shadow-md transition-colors"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              ) : (
                <div className="space-y-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Are you sure? This action cannot be undone. This will permanently delete your account and all associated data.
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700 text-white border-none shadow-md transition-colors"
                      onClick={handleDeleteAccount}
                    >
                      Yes, Delete Account
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  
  if (!mounted) return null;
  
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-700 dark:text-slate-200 font-medium">Dark Mode</span>
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle dark mode"
      />
    </div>
  );
}
