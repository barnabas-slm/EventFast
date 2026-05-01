"use client";

import { PlusCircle } from "lucide-react";
import { useState } from "react";

import { createEvent } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { EventDateTimePicker } from "./event-date-time-picker";

export function CreateEventForm() {
	const [open, setOpen] = useState(false);
	const [showAttendees, setShowAttendees] = useState(true);

	return (
		<Card>
			<CardHeader
				className="cursor-pointer select-none"
				onClick={() => setOpen((prev) => !prev)}
			>
				<CardTitle className="flex items-center gap-2 text-lg">
					<PlusCircle className="h-5 w-5" />
					Create New Event
				</CardTitle>
			</CardHeader>
			{open && (
				<CardContent>
					<form action={createEvent} className="grid gap-4 sm:grid-cols-2">
						<div className="flex flex-col gap-2 sm:col-span-2">
							<Label htmlFor="title">Title</Label>
							<Input id="title" name="title" required placeholder="Team Offsite" />
						</div>

						<div className="flex flex-col gap-2 sm:col-span-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								name="description"
								rows={4}
								placeholder="What is this event about? (optional)"
							/>
						</div>

						<div className="flex flex-col gap-2 sm:col-span-2">
							<Label htmlFor="location">Location</Label>
							<Input id="location" name="location" placeholder="Central Park (optional)" />
						</div>

						<EventDateTimePicker />

						<div className="flex items-center gap-3 sm:col-span-2">
							<Switch
								id="show_attendees"
								name="show_attendees"
								checked={showAttendees}
								onCheckedChange={setShowAttendees}
								value="true"
							/>
							<Label htmlFor="show_attendees" className="cursor-pointer">
								Show attendees publicly
							</Label>
						</div>

						<div className="sm:col-span-2">
							<Button type="submit">Create Event</Button>
						</div>
					</form>
				</CardContent>
			)}
		</Card>
	);
}
