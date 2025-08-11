"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Save } from "lucide-react";

export default function EditTripPage() {
	const params = useParams();
	const router = useRouter();
	const { toast } = useToast();
	const tripId = params?.id as string;

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [name, setName] = useState("");
	const [location, setLocation] = useState("");
	const [start, setStart] = useState("");
	const [end, setEnd] = useState("");
	const [description, setDescription] = useState("");

	useEffect(() => {
		async function fetchTrip() {
			try {
				setLoading(true);
				const token = localStorage.getItem("token");
				const res = await fetch(`http://localhost:5001/api/trips/${tripId}`, {
					headers: token ? { Authorization: `Bearer ${token}` } : undefined,
				}).catch(() => null);
				if (!res || !res.ok) {
					setName("");
					setLocation("");
					setStart("");
					setEnd("");
					setDescription("");
				} else {
					const data = await res.json();
					const t = data.trip || data;
					setName(t.name || "");
					setLocation(t.location || "");
					setStart(t.start_date ? t.start_date.slice(0, 10) : "");
					setEnd(t.end_date ? t.end_date.slice(0, 10) : "");
					setDescription(t.description || "");
				}
			} finally {
				setLoading(false);
			}
		}
		fetchTrip();
	}, [tripId]);

	const handleSave = async () => {
		try {
			setSaving(true);
			const token = localStorage.getItem("token");
			const res = await fetch(`http://localhost:5001/api/trips/${tripId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({
					name,
					location,
					start_date: start,
					end_date: end,
					description,
				}),
			}).catch(() => null);

			if (!res || !res.ok) {
				toast({ title: "Error", description: "Failed to update trip." });
				return;
			}

			toast({ title: "Trip updated" });
			router.push(`/trips/${tripId}`);
		} catch (err: any) {
			toast({ title: "Error", description: err?.message || "Failed to save" });
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-950">
			<Navigation />
			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{loading ? (
					<div className="py-20 text-center text-slate-500">
						Loading trip...
					</div>
				) : (
					<Card>
						<CardHeader>
							<CardTitle>Edit Trip</CardTitle>
							<CardDescription>Update your trip details</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid gap-2">
								<Label htmlFor="name">Trip Name</Label>
								<Input
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="location">Location</Label>
								<Input
									id="location"
									value={location}
									onChange={(e) => setLocation(e.target.value)}
								/>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label
										htmlFor="start"
										className="flex items-center gap-2"
									>
										<Calendar className="h-4 w-4" />
										Start Date
									</Label>
									<Input
										id="start"
										type="date"
										value={start}
										onChange={(e) => setStart(e.target.value)}
									/>
								</div>
								<div className="grid gap-2">
									<Label
										htmlFor="end"
										className="flex items-center gap-2"
									>
										<Calendar className="h-4 w-4" />
										End Date
									</Label>
									<Input
										id="end"
										type="date"
										value={end}
										onChange={(e) => setEnd(e.target.value)}
									/>
								</div>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="desc">Description</Label>
								<Textarea
									id="desc"
									rows={4}
									value={description}
									onChange={(e) => setDescription(e.target.value)}
								/>
							</div>
							<div className="flex justify-end">
								<Button
									onClick={handleSave}
									disabled={saving}
									className="flex items-center gap-2"
								>
									<Save className="h-4 w-4" />
									{saving ? "Saving..." : "Save Changes"}
								</Button>
							</div>
						</CardContent>
					</Card>
				)}
			</main>
		</div>
	);
}
