"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";

function readRequiredString(value: FormDataEntryValue | null, fieldName: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing required field: ${fieldName}`);
  }

  return value.trim();
}

function readOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function readBoolean(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.toLowerCase();
  return normalized === "true" || normalized === "on" || normalized === "1";
}

export async function signIn(email: string) {
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    throw new Error("Email is required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ 
    email: normalizedEmail
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("dashboard");
}

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("You must be signed in to perform this action.");
  }

  return { supabase, user };
}

async function assertEventOwnership(eventId: string, creatorId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, title")
    .eq("id", eventId)
    .eq("creator_id", creatorId)
    .single();

  if (error || !data) {
    throw new Error("Event not found or access denied.");
  }

  return data as { id: string; title: string };
}

export async function createEvent(formData: FormData) {
  const { supabase, user } = await getAuthenticatedUser();

  const title = readRequiredString(formData.get("title"), "title");
  const description = readOptionalString(formData.get("description"));
  const location = readOptionalString(formData.get("location"));
  const eventDate = readOptionalString(formData.get("event_date"));
  const eventTime = readOptionalString(formData.get("event_time"));
  const showAttendees = readBoolean(formData.get("show_attendees"));

  const { error } = await supabase.from("events").insert({
    title,
    description,
    location,
    event_date: eventDate,
    event_time: eventTime,
    show_attendees: showAttendees,
    creator_id: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}

export async function updateEvent(eventId: string, formData: FormData) {
  const normalizedEventId = eventId.trim();

  if (!normalizedEventId) {
    throw new Error("Event ID is required.");
  }

  const { supabase, user } = await getAuthenticatedUser();
  await assertEventOwnership(normalizedEventId, user.id);

  const title = readRequiredString(formData.get("title"), "title");
  const description = readOptionalString(formData.get("description"));
  const location = readOptionalString(formData.get("location"));
  const eventDate = readOptionalString(formData.get("event_date"));
  const eventTime = readOptionalString(formData.get("event_time"));
  const showAttendees = readBoolean(formData.get("show_attendees"));

  const { error } = await supabase
    .from("events")
    .update({
      title,
      description,
      location,
      event_date: eventDate,
      event_time: eventTime,
      show_attendees: showAttendees,
    })
    .eq("id", normalizedEventId)
    .eq("creator_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${normalizedEventId}`);
  revalidatePath(`/e/${normalizedEventId}`);
}

export async function addAttendeeToEvent(eventId: string, name: string) {
  const normalizedEventId = eventId.trim();
  const normalizedName = name.trim();

  if (!normalizedEventId) {
    throw new Error("Event ID is required.");
  }

  if (!normalizedName) {
    throw new Error("Name is required.");
  }

  const { supabase, user } = await getAuthenticatedUser();
  await assertEventOwnership(normalizedEventId, user.id);

  const { error } = await supabase.from("attendees").insert({
    event_id: normalizedEventId,
    name: normalizedName,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/${normalizedEventId}`);
  revalidatePath(`/e/${normalizedEventId}`);
}

export async function removeAttendeeFromEvent(eventId: string, attendeeId: string) {
  const normalizedEventId = eventId.trim();
  const normalizedAttendeeId = attendeeId.trim();

  if (!normalizedEventId) {
    throw new Error("Event ID is required.");
  }

  if (!normalizedAttendeeId) {
    throw new Error("Attendee ID is required.");
  }

  const { supabase, user } = await getAuthenticatedUser();
  await assertEventOwnership(normalizedEventId, user.id);

  const { error } = await supabase
    .from("attendees")
    .delete()
    .eq("id", normalizedAttendeeId)
    .eq("event_id", normalizedEventId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/${normalizedEventId}`);
  revalidatePath(`/e/${normalizedEventId}`);
}

export async function deleteEvent(eventId: string, confirmationTitle: string) {
  const normalizedEventId = eventId.trim();
  const normalizedConfirmationTitle = confirmationTitle.trim();

  if (!normalizedEventId) {
    throw new Error("Event ID is required.");
  }

  if (!normalizedConfirmationTitle) {
    throw new Error("Please type the event title to confirm deletion.");
  }

  const { supabase, user } = await getAuthenticatedUser();
  const event = await assertEventOwnership(normalizedEventId, user.id);

  if (event.title !== normalizedConfirmationTitle) {
    throw new Error("Confirmation title does not match this event.");
  }

  const { error: deleteAttendeesError } = await supabase
    .from("attendees")
    .delete()
    .eq("event_id", normalizedEventId);

  if (deleteAttendeesError) {
    throw new Error(deleteAttendeesError.message);
  }

  const { error: deleteEventError } = await supabase
    .from("events")
    .delete()
    .eq("id", normalizedEventId)
    .eq("creator_id", user.id);

  if (deleteEventError) {
    throw new Error(deleteEventError.message);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${normalizedEventId}`);
  revalidatePath(`/e/${normalizedEventId}`);
}

export async function confirmAttendance(eventId: string, name: string) {
  const normalizedEventId = eventId.trim();
  const normalizedName = name.trim();

  if (!normalizedEventId) {
    throw new Error("Event ID is required.");
  }

  if (!normalizedName) {
    throw new Error("Name is required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("attendees").insert({
    event_id: normalizedEventId,
    name: normalizedName,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/e/${normalizedEventId}`);
  revalidatePath(`/dashboard/${normalizedEventId}`);
}
