"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Edit3, 
  Save, 
  History, 
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Settings,
  Trash2,
  AlertTriangle,
  Shield,
  Key
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/navigation";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import Cropper from 'react-easy-crop';
import { useCallback } from 'react';

const Profile = ({ profile, activityHistory = [] }: { profile?: any, activityHistory?: any[] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: profile?.first_name || "John",
    lastName: profile?.last_name || "Doe",
    email: profile?.email || "john@example.com",
    phone: profile?.phone || "",
    location: profile?.location || ""
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  // Add state for avatar upload
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar || '');
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("http://localhost:5001/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfileData((prev) => ({
            ...prev,
            phone: data.profile?.phone || "",
            location: data.profile?.location || ""
          }));
          setAvatarUrl(data.profile?.avatar || ''); // Update avatarUrl on profile load
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchProfile();
  }, []);

  // Helper to format time as relative
  function timeAgo(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found.");
      const userId = profile?.id;
      if (!userId) throw new Error("User ID not found in profile.");
      // Update user info (first name, last name, email)
      const userRes = await fetch(`http://localhost:5001/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email
        })
      });
      if (!userRes.ok) {
        let errMsg = "Failed to update user info";
        try {
          const err = await userRes.json();
          errMsg = err.error || errMsg;
        } catch (e) {
          const errText = await userRes.text();
          errMsg = errText || errMsg;
        }
        throw new Error(errMsg);
      }
      // Update profile info (phone, location)
      const profileRes = await fetch(`http://localhost:5001/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: profileData.phone,
          location: profileData.location
        })
      });
      if (!profileRes.ok) {
        let errMsg = "Failed to update profile info";
        try {
          const err = await profileRes.json();
          errMsg = err.error || errMsg;
        } catch (e) {
          const errText = await profileRes.text();
          errMsg = errText || errMsg;
        }
        throw new Error(errMsg);
      }
      setIsEditing(false);
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error updating profile",
        description: err.message,
      });
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
        // Clear local storage
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast({
      title: "Logged out!",
      description: "You have been logged out successfully.",
    });
    router.push("/");
  };

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
          Authorization: `Bearer ${token}`,
        },
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

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async (imageSrc: string, crop: any) => {
    const createImage = (url: string) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new window.Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', error => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
      });
    };
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');
    canvas.width = crop.width;
    canvas.height = crop.height;
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );
    return new Promise<string>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        }
      }, 'image/jpeg');
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setShowCropper(true);
  };

  const handleCropConfirm = async () => {
    if (!selectedFile || !croppedAreaPixels) return;
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      const cropped = await getCroppedImg(reader.result as string, croppedAreaPixels);
      setCroppedImage(cropped);
      // Now upload the cropped image
      setAvatarUploading(true);
      try {
        const token = localStorage.getItem('token');
        const blob = await fetch(cropped).then(r => r.blob());
        const formData = new FormData();
        formData.append('avatar', blob, selectedFile.name);
        const res = await fetch('http://localhost:5001/api/profile/avatar', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to upload profile picture');
        }
        const data = await res.json();
        setAvatarUrl(data.avatar);
        toast({ title: 'Profile picture updated!', description: 'Your profile photo has been changed.' });
        setShowCropper(false);
        setSelectedFile(null);
        setCroppedImage(null);
      } catch (err: any) {
        toast({ title: 'Error uploading photo', description: err.message });
      } finally {
        setAvatarUploading(false);
      }
    };
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedFile(null);
    setCroppedImage(null);
  };

  const backendUrl = "http://localhost:5001";
  const avatarSrc = avatarUrl?.startsWith("/uploads/")
    ? backendUrl + avatarUrl
    : avatarUrl || profile?.avatar || "https://github.com/shadcn.png";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-950 relative overflow-hidden">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center mb-3">
            <Sparkles className="mr-3 h-8 w-8 text-blue-500 animate-spin-slow" />
            Profile
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your account and view your activity</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 animate-fade-in bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
            <TabsTrigger value="profile">Profile Info</TabsTrigger>
            <TabsTrigger value="history">Activity History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-8">
            <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Decorative background */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="w-full h-full bg-gradient-to-br from-blue-100/40 via-purple-100/30 to-pink-100/20 dark:from-slate-900/60 dark:via-blue-900/40 dark:to-purple-900/30 rounded-3xl blur-2xl opacity-60" />
              </div>
              {/* Profile Picture & Info */}
              <Card className="lg:col-span-1 bg-white/90 dark:bg-slate-800/90 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700 relative z-10">
                <CardHeader className="text-center">
                  <div className="relative mx-auto w-32 h-32 mb-4 group">
                    <Avatar className="w-32 h-32 mx-auto border-4 border-blue-200 dark:border-blue-800 shadow-lg group-hover:shadow-blue-400 transition-all duration-500">
                      <AvatarImage src={avatarSrc} />
                      <AvatarFallback className="text-2xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">{profileData.firstName[0]}{profileData.lastName[0]}</AvatarFallback>
                    </Avatar>
                    {/* Camera icon overlay for upload */}
                    <label htmlFor="avatar-upload" className="absolute bottom-2 right-2 bg-white dark:bg-slate-700 rounded-full p-2 shadow cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors z-20">
                      <Camera className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={avatarUploading}
                      />
                    </label>
                    {avatarUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-900/70 rounded-full z-30">
                        <span className="text-blue-600 dark:text-blue-300 font-semibold">Uploading...</span>
                      </div>
                    )}
                  </div>
                  {/* Add a Change Photo button below the profile picture */}
                  
                  <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">{profileData.firstName} {profileData.lastName}</CardTitle>
                  {/* Removed username, email, phone, and location for a cleaner look */}
                  <span className={`inline-block text-white text-xs font-semibold px-4 py-1 rounded-full shadow ${
                    profile?.role === 'admin' 
                      ? 'bg-purple-600/90' 
                      : 'bg-blue-600/90'
                  }`}>
                    {profile?.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </CardHeader>
              </Card>
              {/* Profile Form */}
              <div className="lg:col-span-2">
                <Card className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-slate-800 dark:text-slate-100">
                        <User className="mr-2 h-5 w-5" />
                        Personal Information
                      </CardTitle>
                      <Button
                        variant={isEditing ? "default" : "outline"}
                        onClick={isEditing ? handleSave : () => setIsEditing(true)}
                        className="group relative overflow-hidden"
                      >
                        {isEditing ? (
                          <>
                            <Save className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                            Save Changes
                          </>
                        ) : (
                          <>
                            <Edit3 className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                            Edit Profile
                          </>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-slate-700 dark:text-slate-200">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                          disabled={!isEditing}
                          className={`rounded-lg ${isEditing ? "border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-blue-700 dark:focus:border-blue-400 dark:focus:ring-blue-900" : "border-slate-200 dark:border-slate-700"} bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-slate-700 dark:text-slate-200">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                          disabled={!isEditing}
                          className={`rounded-lg ${isEditing ? "border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-blue-700 dark:focus:border-blue-400 dark:focus:ring-blue-900" : "border-slate-200 dark:border-slate-700"} bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center text-slate-700 dark:text-slate-200">
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={!isEditing}
                        className={`rounded-lg ${isEditing ? "border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-blue-700 dark:focus:border-blue-400 dark:focus:ring-blue-900" : "border-slate-200 dark:border-slate-700"} bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center text-slate-700 dark:text-slate-200">
                        <Phone className="mr-2 h-4 w-4" />
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!isEditing}
                        className={`rounded-lg ${isEditing ? "border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-blue-700 dark:focus:border-blue-400 dark:focus:ring-blue-900" : "border-slate-200 dark:border-slate-700"} bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center text-slate-700 dark:text-slate-200">
                        <MapPin className="mr-2 h-4 w-4" />
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        disabled={!isEditing}
                        className={`rounded-lg ${isEditing ? "border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-blue-700 dark:focus:border-blue-400 dark:focus:ring-blue-900" : "border-slate-200 dark:border-slate-700"} bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-8">
            <Card className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-800 dark:text-slate-100">
                  <History className="mr-2 h-5 w-5" />
                  Activity History
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">Your recent account activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    // Find the latest 'Profile Updated' activity by created_at
                    let latestProfileUpdate = null;
                    // Find the second most recent 'Last Login' activity
                    const lastLoginActivities = activityHistory
                      .filter(item => item.title === 'Last Login')
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    const secondLatestLogin = lastLoginActivities[1] || null;

                    for (const item of activityHistory) {
                      if (item.title === 'Profile Updated') {
                        if (!latestProfileUpdate || new Date(item.created_at) > new Date(latestProfileUpdate.created_at)) {
                          latestProfileUpdate = item;
                        }
                      }
                    }

                    // Collect all other activity types except 'Profile Updated' and 'Last Login'
                    const filtered = activityHistory.filter(item =>
                      ['Password Changed', 'Account Created'].includes(item.title)
                    );

                    // Add the latest profile update and the second latest login (if any)
                    if (latestProfileUpdate) filtered.unshift(latestProfileUpdate);
                    if (secondLatestLogin) filtered.unshift(secondLatestLogin);

                    return filtered.map((item, index) => (
                      <div key={item.id || index} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-all duration-300 group">
                        <div className="w-3 h-3 bg-blue-500 rounded-full group-hover:scale-150 group-hover:shadow-lg transition-all duration-300" />
                        <div className="flex-1">
                          <p className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {timeAgo(item.created_at)}
                          </p>
                        </div>
                        <Badge 
                          className={
                            item.title === 'Password Changed'
                              ? 'bg-red-600 text-white px-3 py-1 rounded-full font-semibold shadow group-hover:shadow-lg transition-shadow'
                              : 'bg-slate-200 text-slate-800 px-3 py-1 rounded-full font-semibold shadow group-hover:shadow-lg transition-shadow dark:bg-slate-700 dark:text-slate-200'
                          }
                        >
                          {item.title === 'Profile Updated' ? 'edit' :
                           item.title === 'Password Changed' ? 'security' :
                           item.title === 'Account Created' ? 'system' :
                           item.title === 'Last Login' ? 'login' :
                           ''}
                        </Badge>
                      </div>
                    ));
                  })()}
                  {activityHistory.filter(item => [
                    'Profile Updated',
                    'Password Changed',
                    'Account Created',
                    'Last Login'
                  ].includes(item.title)).length === 0 && (
                    <div className="text-center text-slate-400">No activity found.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Security Settings */}
              <Card className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800 dark:text-slate-100">
                    <Shield className="mr-2 h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowChangePassword((v) => !v)}>
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
                  {/* Theme Toggle Section */}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-slate-700 dark:text-slate-200 font-medium flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Theme
                    </span>
                    <ThemeToggleSettings />
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-red-200 dark:border-red-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600 dark:text-red-400">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">Irreversible and destructive actions</CardDescription>
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
          </TabsContent>
        </Tabs>
      </main>
      {/* Cropper Modal */}
      {showCropper && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl flex flex-col items-center min-w-[340px]">
            <div className="relative w-72 h-72 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden">
              <Cropper
                image={URL.createObjectURL(selectedFile)}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            {/* Zoom Slider */}
            <div className="w-64 flex items-center gap-2 mt-4">
              <span className="text-xs text-slate-500">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="flex-1 accent-blue-500"
              />
              <span className="text-xs text-slate-500">{zoom.toFixed(2)}x</span>
            </div>
            {/* Live Preview */}
            {croppedAreaPixels && (
              <div className="mt-4 flex flex-col items-center">
                <span className="block text-center text-slate-700 dark:text-slate-200 mb-2">Preview:</span>
                <CroppedPreview image={URL.createObjectURL(selectedFile)} crop={croppedAreaPixels} />
              </div>
            )}
            <div className="flex gap-4 mt-4">
              <Button onClick={handleCropCancel} variant="outline">Cancel</Button>
              <Button onClick={handleCropConfirm} disabled={avatarUploading}>
                {avatarUploading ? 'Uploading...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function ThemeToggleSettings() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-slate-500">🌞</span>
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle dark mode"
      />
      <span className="text-xs text-slate-500">🌙</span>
    </div>
  );
}

export default Profile;

function CroppedPreview({ image, crop }: { image: string, crop: any }) {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    async function generatePreview() {
      const img = new window.Image();
      img.src = image;
      await new Promise(res => { img.onload = res; });
      const canvas = document.createElement('canvas');
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
      setPreview(canvas.toDataURL('image/jpeg'));
    }
    generatePreview();
  }, [image, crop]);
  if (!preview) return <div className="w-24 h-24 bg-slate-300 dark:bg-slate-700 rounded-full animate-pulse" />;
  return <img src={preview} alt="Cropped preview" className="w-24 h-24 rounded-full mx-auto border-2 border-blue-400" />;
}