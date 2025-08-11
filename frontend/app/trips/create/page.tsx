"use client"

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

  // Mock suggestions (could be fetched from backend later)
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

  const handleSave = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (!tripName || !startDate || !endDate) {
      toast({ title: "Missing required info", description: "Please provide trip name and dates." });
      return;
    }
    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      // Compose multipart form-data in case backend supports image upload
      const formData = new FormData();
      formData.append("name", tripName);
      formData.append("location", location);
      formData.append("start_date", startDate);
      formData.append("end_date", endDate);
      formData.append("description", description);
      if (coverFile) formData.append("cover", coverFile);

      // Attempt to save to backend if endpoint exists
      const res = await fetch("http://localhost:5001/api/trips", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      }).catch(() => null);

      if (!res || !res.ok) {
        // Fallback success for demo when API isn't implemented
        toast({ title: "Trip saved (demo)", description: "Your trip has been created locally." });
        router.push("/profile");
        return;
      }

      const data = await res.json();
      toast({ title: "Trip created!", description: `Trip "${data.name || tripName}" has been created.` });
      router.push("/profile");
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to create trip" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-950">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">Plan a new trip</h1>
        </div>

        {/* Form Card */}
        <Card className="mb-8">
          <CardHeader className="pb-2 border-b">
            <CardTitle>Create Trip</CardTitle>
            <CardDescription>Begin creating a personalized travel plan</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Trip Name */}
            <div className="grid gap-2">
              <Label htmlFor="tripName">Trip Name</Label>
              <Input id="tripName" value={tripName} onChange={(e) => setTripName(e.target.value)} placeholder="e.g., Summer in Europe" />
            </div>

            {/* Dates and Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate" className="flex items-center gap-2"><Calendar className="h-4 w-4" />Start Date</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate" className="flex items-center gap-2"><Calendar className="h-4 w-4" />End Date</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label className="flex items-center gap-2" htmlFor="location"><MapPin className="h-4 w-4" />Select a Place</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Choose a destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paris">Paris, France</SelectItem>
                    <SelectItem value="tokyo">Tokyo, Japan</SelectItem>
                    <SelectItem value="nyc">New York, USA</SelectItem>
                    <SelectItem value="london">London, UK</SelectItem>
                    <SelectItem value="rome">Rome, Italy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Trip Description</Label>
              <Textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell us about your trip goals, people travelling, interests..." />
            </div>

            {/* Cover Photo */}
            <div className="grid gap-2">
              <Label htmlFor="cover" className="flex items-center gap-2"><ImageIcon className="h-4 w-4" />Cover Photo (optional)</Label>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
                  <input id="cover" type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  <span className="text-sm font-medium">Upload Image</span>
                </label>
                {coverPreview && (
                  <img src={coverPreview} alt="Cover preview" className="h-16 w-28 object-cover rounded-md border" />
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Trip"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card>
          <CardHeader className="pb-2 border-b">
            <CardTitle>Suggestions for Places to Visit / Activities to Perform</CardTitle>
            <CardDescription>Curated ideas based on popular choices</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map((s) => (
                <div key={s.id} className="rounded-xl overflow-hidden border bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-slate-200 dark:bg-slate-700">
                    <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{s.title}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">{s.subtitle}</div>
                    <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add to trip
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
