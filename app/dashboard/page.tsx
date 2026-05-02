import { CalendarDays, Eye, EyeOff, MapPin } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";

import { CopyLinkButton } from "./copy-link-button";
import { CreateEventForm } from "./create-event-form";

type EventItem = {
	id: string;
	title: string;
	description: string | null;
	location: string | null;
	event_date: string | null;
	event_time: string | null;
	show_attendees: boolean;
};

function formatEventDate(dateValue: string | null) {
	if (!dateValue) {
		return null;
	}

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

function formatEventTime(timeValue: string | null) {
	if (!timeValue) {
		return null;
	}

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

				<CreateEventForm />

				<section className="grid gap-4 sm:grid-cols-2">
					{events.length === 0 ? (
						<div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-600 sm:col-span-2">
							You have no events yet. Create one above to get started.
						</div>
					) : (
						events.map((event) => {
							const formattedDate = formatEventDate(event.event_date);
							const formattedTime = formatEventTime(event.event_time);

							return (
								<Card key={event.id} className="flex flex-col">
									<CardHeader>
										<div>
											<CardTitle className="text-lg">{event.title}</CardTitle>
											{event.description && (
												<p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
											)}
											{event.location && (
												<p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
													<MapPin className="h-4 w-4 shrink-0" />
													{event.location}
												</p>
											)}
											{(formattedDate || formattedTime) && (
												<p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
													<CalendarDays className="h-4 w-4 shrink-0" />
													{formattedDate && formattedTime
														? `${formattedDate} at ${formattedTime}`
														: formattedDate ?? formattedTime}
												</p>
											)}
										</div>
									</CardHeader>
									<CardContent className="mt-auto flex flex-col gap-3">
										<Badge variant={event.show_attendees ? "secondary" : "outline"} className="w-fit gap-1">
											{event.show_attendees ? (
												<><Eye className="h-3 w-3" /> Attendees visible</>
											) : (
												<><EyeOff className="h-3 w-3" /> Attendees hidden</>
											)}
										</Badge>
										<div className="flex items-center gap-2">
											<Button asChild size="sm" variant="secondary">
												<Link href={`/dashboard/${event.id}`}>Manage</Link>
											</Button>
											<CopyLinkButton eventId={event.id} />
										</div>
									</CardContent>
								</Card>
							);
						})
					)}
				</section>
			</div>
		</main>
	);
}
