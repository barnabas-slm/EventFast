import { ArrowLeft, CalendarDays, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";

import { DeleteEventSection } from "./delete-event-section";
import { EditEventForm } from "./edit-event-form";
import { ManageAttendeesSection } from "./manage-attendees-section";

type EventRecord = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string | null;
  event_time: string | null;
  show_attendees: boolean;
};

type AttendeeRecord = {
  id: string;
  name: string;
};

type DashboardEventPageProps = {
  params: {
    id: string;
  };
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

export default async function DashboardEventPage({ params }: DashboardEventPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, title, description, location, event_date, event_time, show_attendees")
    .eq("id", id)
    .eq("creator_id", user.id)
    .single();

  if (eventError || !event) {
    notFound();
  }

  const { data: attendeesData, error: attendeesError } = await supabase
    .from("attendees")
    .select("id, name")
    .eq("event_id", event.id)
    .order("name", { ascending: true });

  if (attendeesError) {
    throw new Error(attendeesError.message);
  }

  const eventData = event as EventRecord;
  const attendees = (attendeesData ?? []) as AttendeeRecord[];
  const formattedDate = formatEventDate(eventData.event_date);
  const formattedTime = formatEventTime(eventData.event_time);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Event details
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
            <div>
              <Badge variant={eventData.show_attendees ? "secondary" : "outline"}>
                {eventData.show_attendees ? "Attendees visible publicly" : "Attendees hidden publicly"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <EditEventForm event={eventData} />

        <ManageAttendeesSection eventId={eventData.id} attendees={attendees} />

        <DeleteEventSection eventId={eventData.id} eventTitle={eventData.title} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5" />
              Current Attendees
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendees.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attendees yet.</p>
            ) : (
              <ul className="space-y-2">
                {attendees.map((attendee) => (
                  <li key={attendee.id} className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
                    {attendee.name}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
