import { redirect } from "next/navigation";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import { EventsList, type EventItem } from "@/app/dashboard/events-list";

import { CreateEventForm } from "./create-event-form";

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
		.select("id, title, description, location, event_date, event_time, show_attendees, created_at")
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

				<EventsList events={events} />
			</div>
		</main>
	);
}
