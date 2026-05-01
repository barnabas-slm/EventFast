import { CalendarDays, Eye, EyeOff, MapPin, PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";

import { createEvent } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/server";

import { CopyLinkButton } from "./copy-link-button";
import { EventDateTimePicker } from "./event-date-time-picker";

type EventItem = {
	id: string;
	title: string;
	description: string;
	location: string;
	event_date: string;
	event_time: string;
	show_attendees: boolean;
};

function formatEventDate(dateValue: string) {
	const parsedDate = new Date(`${dateValue}T00:00:00`);

	if (Number.isNaN(parsedDate.getTime())) {
		return dateValue;
	}

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(parsedDate);
}

function formatEventTime(timeValue: string) {
	const [hoursText, minutesText] = timeValue.split(":");
	const hours = Number.parseInt(hoursText ?? "", 10);
	const minutes = Number.parseInt(minutesText ?? "", 10);

	if (Number.isNaN(hours) || Number.isNaN(minutes)) {
		return timeValue;
	}

	const parsedDate = new Date();
	parsedDate.setHours(hours, minutes, 0, 0);

	return new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "2-digit",
	}).format(parsedDate);
}

export default async function DashboardPage() {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		redirect("/login");
	}

	const { data, error } = await supabase
		.from("events")
		.select("id, title, description, location, event_date, event_time, show_attendees")
		.eq("creator_id", user.id);

	if (error) {
		throw new Error(error.message);
	}

	const events: EventItem[] = (data ?? []) as EventItem[];

	return (
		<main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-8">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
				<Card>
					<CardHeader>
						<p className="text-sm font-medium text-muted-foreground">Dashboard</p>
						<CardTitle className="text-3xl">Your Events</CardTitle>
						<p className="text-sm text-muted-foreground">
							Create and manage events, then share public links instantly.
						</p>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<PlusCircle className="h-5 w-5" />
							Create New Event
						</CardTitle>
					</CardHeader>
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
									required
									rows={4}
									placeholder="What is this event about?"
								/>
							</div>

							<div className="flex flex-col gap-2 sm:col-span-2">
								<Label htmlFor="location">Location</Label>
								<Input id="location" name="location" required placeholder="Central Park" />
							</div>


							<EventDateTimePicker />

							<label className="inline-flex items-center gap-2 text-sm font-medium">
								<input
									type="checkbox"
									name="show_attendees"
									className="h-4 w-4 rounded border-zinc-300"
								/>
								Show attendees publicly
							</label>

							<div className="sm:col-span-2">
								<Button type="submit">Create Event</Button>
							</div>
						</form>
					</CardContent>
				</Card>

				<section className="grid gap-4 sm:grid-cols-2">
					{events.length === 0 ? (
						<div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-600 sm:col-span-2">
							You have no events yet. Create one above to get started.
						</div>
					) : (
						events.map((event) => (
							<Card key={event.id}>
								<CardHeader>
									<div>
										<CardTitle className="text-lg">{event.title}</CardTitle>
										<p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
										<div>
											<p className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground">
												<MapPin className="h-4 w-4" />
												{event.location}
											</p>
										</div>
										<div>
											<p className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground">
												<CalendarDays className="h-4 w-4" />
												{formatEventDate(event.event_date)} at {formatEventTime(event.event_time)}
											</p>
										</div>
									</div>
								</CardHeader>
								<CardContent className="flex flex-col gap-3">
									<Badge variant={event.show_attendees ? "secondary" : "outline"} className="w-fit gap-1">
										{event.show_attendees ? (
											<><Eye className="h-3 w-3" /> Attendees visible</>
										) : (
											<><EyeOff className="h-3 w-3" /> Attendees hidden</>
										)}
									</Badge>
									<CopyLinkButton eventId={event.id} />
								</CardContent>
							</Card>
						))
					)}
				</section>
			</div>
		</main>
	);
}
