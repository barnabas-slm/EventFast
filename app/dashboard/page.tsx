import { CalendarDays, Eye, EyeOff, PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";

import { createEvent } from "@/app/actions";
import { createClient } from "@/utils/supabase/server";

import { CopyLinkButton } from "./copy-link-button";

type EventItem = {
	id: string;
	title: string;
	description: string;
	show_attendees: boolean;
};

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
		.select("id, title, description, show_attendees")
		.eq("user_id", user.id);

	if (error) {
		throw new Error(error.message);
	}

	const events: EventItem[] = (data ?? []) as EventItem[];
	// const events: EventItem[] = [];

	return (
		<main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-8">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
				<header className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
					<p className="text-sm font-medium text-zinc-500">Dashboard</p>
					<h1 className="mt-2 text-3xl font-semibold tracking-tight">Your Events</h1>
					<p className="mt-2 text-sm text-zinc-600">
						Create and manage events, then share public links instantly.
					</p>
				</header>

				<section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
					<div className="mb-5 flex items-center gap-2 text-lg font-semibold">
						<PlusCircle className="h-5 w-5" />
						Create New Event
					</div>

					<form action={createEvent} className="grid gap-4 sm:grid-cols-2">
						<label className="flex flex-col gap-2 sm:col-span-2">
							<span className="text-sm font-medium text-zinc-700">Title</span>
							<input
								name="title"
								required
								className="rounded-lg border border-zinc-300 px-3 py-2 outline-none ring-emerald-200 transition focus:ring"
								placeholder="Team Offsite"
							/>
						</label>

						<label className="flex flex-col gap-2 sm:col-span-2">
							<span className="text-sm font-medium text-zinc-700">Description</span>
							<textarea
								name="description"
								required
								rows={4}
								className="rounded-lg border border-zinc-300 px-3 py-2 outline-none ring-emerald-200 transition focus:ring"
								placeholder="What is this event about?"
							/>
						</label>

						<label className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700">
							<input
								type="checkbox"
								name="show_attendees"
								className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
							/>
							Show attendees publicly
						</label>

						<div className="sm:col-span-2">
							<button
								type="submit"
								className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
							>
								Create Event
							</button>
						</div>
					</form>
				</section>

				<section className="grid gap-4 sm:grid-cols-2">
					{events.length === 0 ? (
						<div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-600 sm:col-span-2">
							You have no events yet. Create one above to get started.
						</div>
					) : (
						events.map((event) => (
							<article
								key={event.id}
								className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
							>
								<div className="mb-3 flex items-start justify-between gap-3">
									<div>
										<h2 className="text-lg font-semibold tracking-tight">{event.title}</h2>
										<p className="mt-1 text-sm text-zinc-600">{event.description}</p>
									</div>
									<CalendarDays className="mt-1 h-5 w-5 shrink-0 text-zinc-400" />
								</div>

								<div className="mb-4 flex items-center gap-2 text-sm text-zinc-600">
									{event.show_attendees ? (
										<>
											<Eye className="h-4 w-4" />
											Attendees visible
										</>
									) : (
										<>
											<EyeOff className="h-4 w-4" />
											Attendees hidden
										</>
									)}
								</div>

								<CopyLinkButton eventId={event.id} />
							</article>
						))
					)}
				</section>
			</div>
		</main>
	);
}
