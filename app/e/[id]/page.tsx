import { ListChecks, Users } from "lucide-react";
import { notFound } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import { ConfirmAttendanceSection } from "./confirm-attendance-section";

type EventRecord = {
	id: string;
	title: string;
	description: string;
	show_attendees: boolean;
};

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
		.select("id, title, description, show_attendees")
		.eq("id", id)
		.single();

	if (eventError || !event) {
		notFound();
	}

	const eventData = event as EventRecord;
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
				<header className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
					<p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
						Event
					</p>
					<h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
						{eventData.title}
					</h1>
					<p className="mt-4 text-lg leading-8 text-zinc-700">
						{eventData.description}
					</p>
				</header>

				<ConfirmAttendanceSection eventId={eventData.id} />

				{eventData.show_attendees && (
					<section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
						<div className="mb-4 flex items-center gap-2 text-xl font-semibold tracking-tight text-zinc-900">
							<Users className="h-5 w-5" />
							Attendees
						</div>

						{attendees.length === 0 ? (
							<p className="text-sm text-zinc-600">
								No one has confirmed yet. Be the first.
							</p>
						) : (
							<ul className="space-y-2">
								{attendees.map((attendee) => (
									<li
										key={attendee.id}
										className="inline-flex w-full items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800"
									>
										<ListChecks className="h-4 w-4 text-emerald-600" />
										{attendee.name}
									</li>
								))}
							</ul>
						)}
					</section>
				)}
			</div>
		</main>
	);
}
