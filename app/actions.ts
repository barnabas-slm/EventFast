"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/dist/server/api-utils";

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

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("You must be signed in to create an event.");
  }

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

  revalidatePath(`/events/${normalizedEventId}`);
  revalidatePath(`/e/${normalizedEventId}`);
}
