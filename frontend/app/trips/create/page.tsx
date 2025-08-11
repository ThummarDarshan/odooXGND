"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Image as ImageIcon, MapPin, Save, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { decodeJWT } from "@/lib/jwt-decode";

export default function CreateTripPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [tripName, setTripName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const suggestions = [
    { id: 1, title: "Eiffel Tower", subtitle: "Paris • Landmark", image: "/placeholder.jpg" },
    { id: 2, title: "Shibuya Crossing", subtitle: "Tokyo • City Life", image: "/placeholder.jpg" },
    { id: 3, title: "Colosseum", subtitle: "Rome • History", image: "/placeholder.jpg" },
    { id: 4, title: "Central Park", subtitle: "NYC • Nature", image: "/placeholder.jpg" },
    { id: 5, title: "London Eye", subtitle: "London • Views", image: "/placeholder.jpg" },
    { id: 6, title: "Sagrada Família", subtitle: "Barcelona • Architecture", image: "/placeholder.jpg" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!tripName.trim()) newErrors.tripName = "Trip name is required.";
    if (!startDate) newErrors.startDate = "Start date is required.";
    if (!endDate) newErrors.endDate = "End date is required.";
    if (!location) newErrors.location = "Location is required.";
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = "End date cannot be before start date.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (!validate()) return;
    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const formData = new FormData();
      formData.append("name", tripName);
      formData.append("location", location);
      formData.append("start_date", startDate);
      formData.append("end_date", endDate);
      formData.append("description", description);
      if (coverFile) formData.append("cover", coverFile);

      const res = await fetch("http://localhost:5001/api/trips", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast({ title: "Error", description: errorData.error || "Failed to create trip. Please try again." });
        return;
      }

      const data = await res.json();
      toast({ title: "Trip created!", description: `Trip \"${data.name || tripName}\" has been created.` });
      router.push("/profile");
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to create trip" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-2">Plan a New Trip</h1>
          <p className="text-slate-600 dark:text-slate-300 mb-8">
            Create a personalized itinerary and make your dream trip a reality.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="mb-10 border-none shadow-lg rounded-2xl backdrop-blur bg-white/70 dark:bg-slate-800/70">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Create Trip</CardTitle>
              <CardDescription>Fill out the details for your journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div>
                <Label htmlFor="tripName">Trip Name</Label>
                <Input id="tripName" value={tripName} onChange={(e) => setTripName(e.target.value)} placeholder="e.g., Summer in Europe" className={errors.tripName ? 'border-red-500' : ''} />
                {errors.tripName && <p className="text-red-500 text-xs mt-1">{errors.tripName}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startDate" className="flex items-center gap-2"><Calendar className="h-4 w-4" />Start Date</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={errors.startDate ? 'border-red-500' : ''} />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                </div>
                <div>
                  <Label htmlFor="endDate" className="flex items-center gap-2"><Calendar className="h-4 w-4" />End Date</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={errors.endDate ? 'border-red-500' : ''} />
                  {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                </div>
                <div>
                  <Label htmlFor="location" className="flex items-center gap-2"><MapPin className="h-4 w-4" />Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger id="location" className={errors.location ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Choose destination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paris">Paris, France</SelectItem>
                      <SelectItem value="tokyo">Tokyo, Japan</SelectItem>
                      <SelectItem value="nyc">New York, USA</SelectItem>
                      <SelectItem value="london">London, UK</SelectItem>
                      <SelectItem value="rome">Rome, Italy</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Trip Description</Label>
                <Textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your trip goals, companions, and activities..." />
              </div>

              <div>
                <Label htmlFor="cover" className="flex items-center gap-2"><ImageIcon className="h-4 w-4" />Cover Photo</Label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    <input id="cover" type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                    <span className="text-sm font-medium">Upload Image</span>
                  </label>
                  {coverPreview && (
                    <img src={coverPreview} alt="Cover preview" className="h-16 w-28 object-cover rounded-lg border" />
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white shadow-md">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Trip"}
                </Button>
              </div>

            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="border-none shadow-lg rounded-2xl backdrop-blur bg-white/70 dark:bg-slate-800/70">
            <CardHeader>
              <CardTitle>Suggestions for Places & Activities</CardTitle>
              <CardDescription>Popular picks for inspiration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.map((s) => (
                  <motion.div key={s.id} whileHover={{ scale: 1.02 }} className="rounded-xl overflow-hidden border bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition">
                    <div className="aspect-video overflow-hidden">
                      <img src={s.image} alt={s.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{s.title}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">{s.subtitle}</div>
                      <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add to Trip
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </main>
    </div>
  );
}
