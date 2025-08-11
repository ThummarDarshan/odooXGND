"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Edit3, 
  Save, 
  Camera,
  Mail,
  Phone,
  MapPin,
  Plane,
  Calendar,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/navigation";
import { useRouter } from "next/navigation";
import Cropper from 'react-easy-crop';
import { useCallback } from 'react';

const Profile = ({ profile, activityHistory = [] }: { profile?: any, activityHistory?: any[] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: profile?.first_name || "John",
    lastName: profile?.last_name || "Doe",
    email: profile?.email || "john@example.com",
    phone: profile?.phone || "",
    location: profile?.location || ""
  });
  const { toast } = useToast();
  const router = useRouter();
  
  // Avatar upload state
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar || '');
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  // Mock trip data - replace with real data from your backend
  const [preplannedTrips] = useState([
    { id: 1, title: "Paris Adventure", date: "2024-06-15", destination: "Paris, France" },
    { id: 2, title: "Tokyo Exploration", date: "2024-07-20", destination: "Tokyo, Japan" },
    { id: 3, title: "New York City", date: "2024-08-10", destination: "New York, USA" }
  ]);

  const [previousTrips] = useState([
    { id: 1, title: "London Trip", date: "2024-03-15", destination: "London, UK" },
    { id: 2, title: "Rome Vacation", date: "2024-02-20", destination: "Rome, Italy" },
    { id: 3, title: "Barcelona Holiday", date: "2024-01-10", destination: "Barcelona, Spain" }
  ]);

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
          setAvatarUrl(data.profile?.avatar || '');
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchProfile();
  }, []);

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
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* GlobalTrotter Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            GlobalTrotter
          </h1>
        </div>

        {/* User Details Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-blue-200 dark:border-blue-800 shadow-lg">
                  <AvatarImage src={avatarSrc} />
                  <AvatarFallback className="text-3xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                    {profileData.firstName[0]}{profileData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="avatar-upload" className="absolute bottom-2 right-2 bg-white dark:bg-slate-700 rounded-full p-2 shadow cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">
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
              </div>
            </div>

            {/* User Information */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  User Details
                </h2>
                <div className="flex gap-3">
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    {isEditing ? (
                      <>
                        <Save className="h-4 w-4" />
                        Save
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-700 dark:text-slate-200">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    disabled={!isEditing}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-700 dark:text-slate-200">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    disabled={!isEditing}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-200">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled={!isEditing}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 dark:text-slate-200">Phone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    disabled={!isEditing}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location" className="text-slate-700 dark:text-slate-200">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    disabled={!isEditing}
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preplanned Trips Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100 mb-6">
            Preplanned Trips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {preplannedTrips.map((trip) => (
              <Card key={trip.id} className="bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Plane className="h-5 w-5 text-blue-500" />
                    {trip.title}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    {trip.destination}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <Calendar className="h-4 w-4" />
                    {trip.date}
                  </div>
                  <Button className="w-full" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Previous Trips Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100 mb-6">
            Previous Trips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previousTrips.map((trip) => (
              <Card key={trip.id} className="bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Plane className="h-5 w-5 text-green-500" />
                    {trip.title}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    {trip.destination}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <Calendar className="h-4 w-4" />
                    {trip.date}
                  </div>
                  <Button className="w-full" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
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