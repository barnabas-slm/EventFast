import { CalendarDays, Check, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Item } from "@/components/ui/item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyLinkButton } from "@/app/dashboard/copy-link-button";
import { createClient } from "@/utils/supabase/server";

import { ConfirmAttendanceSection } from "./confirm-attendance-section";

type EventRecord = {
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
		weekday: "short",
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

type AttendeeRecord = {
	id: string;
	name: string;
};

type EventPageProps = {
	params: {
		id: string;
	};
};

export default async function EventPage({ params }: EventPageProps) {
	const supabase = await createClient();
	const { id } = await params;
	
	const { data: event, error: eventError } = await supabase
		.from("events")
		.select("id, title, description, location, event_date, event_time, show_attendees")
		.eq("id", id)
		.single();

	if (eventError || !event) {
		notFound();
	}

	const eventData = event as EventRecord;
	const formattedDate = formatEventDate(eventData.event_date);
	const formattedTime = formatEventTime(eventData.event_time);
	let attendees: AttendeeRecord[] = [];

	if (eventData.show_attendees) {
		const { data: attendeesData, error: attendeesError } = await supabase
			.from("attendees")
			.select("id, name")
			.eq("event_id", eventData.id)
			.order("name", { ascending: true });

		if (attendeesError) {
			throw new Error(attendeesError.message);
		}

		attendees = (attendeesData ?? []) as AttendeeRecord[];
	}

	return (
		<main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-8">
			<div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
				<Card>
					<CardHeader>
						<p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
							Event
						</p>
						<CardTitle className="text-4xl sm:text-5xl">{eventData.title}</CardTitle>
						{eventData.description && (
							<p className="text-lg leading-8 text-muted-foreground">{eventData.description}</p>
						)}
					</CardHeader>
					<CardContent className="grid gap-2 text-sm text-muted-foreground">
						{eventData.location && (
							<p className="inline-flex items-center gap-2">
								<MapPin className="h-4 w-4" />
								{eventData.location}
							</p>
						)}
						{(formattedDate || formattedTime) && (
							<p className="inline-flex items-center gap-2">
								<CalendarDays className="h-4 w-4" />
								{formattedDate && formattedTime
									? `${formattedDate} at ${formattedTime}`
									: formattedDate ?? formattedTime}
							</p>
						)}
						<div className="pt-2">
							<CopyLinkButton eventId={eventData.id} />
						</div>
					</CardContent>
				</Card>

				<ConfirmAttendanceSection eventId={eventData.id} />

				{eventData.show_attendees && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-xl">
								<Users className="h-5 w-5" />
								Attendees
							</CardTitle>
						</CardHeader>
						<CardContent>
							{attendees.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									No one has confirmed yet. Be the first.
								</p>
							) : (
								<ul className="space-y-2">
									{attendees.map((attendee) => (
										<li key={attendee.id}>
											<Item variant="outline">
												<Check className="h-4 w-4 text-emerald-600" />
												{attendee.name}
											</Item>
										</li>
									))}
								</ul>
							)}
						</CardContent>
					</Card>
				)}

				<div className="pt-2 text-center">
					<Link
						href="/dashboard"
						className="text-sm font-medium text-primary underline-offset-4 hover:underline"
					>
						Create an event
					</Link>
				</div>
			</div>
		</main>
	);
}
