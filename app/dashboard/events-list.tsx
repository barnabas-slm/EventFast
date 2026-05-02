"use client";

import { useDeferredValue, useState } from "react";
import { CalendarDays, Eye, EyeOff, MapPin, Search } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { CopyLinkButton } from "./copy-link-button";

export type EventItem = {
	id: string;
	title: string;
	description: string | null;
	location: string | null;
	event_date: string | null;
	event_time: string | null;
	show_attendees: boolean;
	created_at: string;
};

type EventsListProps = {
	events: EventItem[];
};

type SortOption = "event-date" | "creation-date";

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

function getEventDateSortValue(event: EventItem) {
	if (!event.event_date) {
		return Number.POSITIVE_INFINITY;
	}

	const eventTime = event.event_time ? `${event.event_time}:00` : "23:59:59";
	const parsedDate = new Date(`${event.event_date}T${eventTime}`);

	if (Number.isNaN(parsedDate.getTime())) {
		return Number.POSITIVE_INFINITY;
	}

	return parsedDate.getTime();
}

function getCreationDateSortValue(event: EventItem) {
	const parsedDate = new Date(event.created_at);

	if (Number.isNaN(parsedDate.getTime())) {
		return Number.NEGATIVE_INFINITY;
	}

	return parsedDate.getTime();
}

function matchesSearch(event: EventItem, normalizedQuery: string) {
	if (!normalizedQuery) {
		return true;
	}

	const haystacks = [event.title, event.description, event.location];

	return haystacks.some((value) => value?.toLowerCase().includes(normalizedQuery));
}

function sortEvents(events: EventItem[], sortOption: SortOption) {
	const sortedEvents = [...events];

	if (sortOption === "creation-date") {
		sortedEvents.sort((left, right) => getCreationDateSortValue(right) - getCreationDateSortValue(left));
		return sortedEvents;
	}

	sortedEvents.sort((left, right) => getEventDateSortValue(left) - getEventDateSortValue(right));
	return sortedEvents;
}

export function EventsList({ events }: EventsListProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [sortOption, setSortOption] = useState<SortOption>("event-date");
	const deferredSearchQuery = useDeferredValue(searchQuery);
	const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
	const visibleEvents = sortEvents(
		events.filter((event) => matchesSearch(event, normalizedQuery)),
		sortOption,
	);

	if (events.length === 0) {
		return (
			<section>
				<div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-600">
					You have no events yet. Create one above to get started.
				</div>
			</section>
		);
	}

	return (
		<section className="flex flex-col gap-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="relative flex-1">
					<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="search"
						value={searchQuery}
						onChange={(event) => setSearchQuery(event.target.value)}
						placeholder="Search by title, description, or location"
						className="pl-10"
					/>
				</div>
				<Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
					<SelectTrigger className="w-full sm:w-[220px]">
						<SelectValue placeholder="Sort events" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="event-date">Event date</SelectItem>
						<SelectItem value="creation-date">Creation date</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{visibleEvents.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-600">
					No events match your current search.
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2">
					{visibleEvents.map((event) => {
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
					})}
				</div>
			)}
		</section>
	);
}