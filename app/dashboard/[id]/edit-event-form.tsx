"use client";

import { CheckCircle2, PencilLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateEvent } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { EventDateTimePicker } from "../event-date-time-picker";

type EditEventFormProps = {
  event: {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    event_date: string | null;
    event_time: string | null;
    show_attendees: boolean;
  };
};

export function EditEventForm({ event }: EditEventFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showAttendees, setShowAttendees] = useState(event.show_attendees);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setStatus("idle");
    setErrorMessage("");

    startTransition(async () => {
      try {
        await updateEvent(event.id, formData);
        setStatus("success");
        router.refresh();
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Could not update this event.",
        );
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PencilLine className="h-5 w-5" />
              Edit Event
            </CardTitle>
            <CardDescription>Update details visible on the public event page.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setOpen((prev) => !prev);
              setStatus("idle");
              setErrorMessage("");
            }}
          >
            {open ? "Hide" : "Edit"}
          </Button>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="flex flex-col gap-4">
          <form action={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" name="title" defaultValue={event.title} required />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                rows={4}
                defaultValue={event.description ?? ""}
                placeholder="What is this event about? (optional)"
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                name="location"
                defaultValue={event.location ?? ""}
                placeholder="Central Park (optional)"
              />
            </div>

            <EventDateTimePicker
              initialDateValue={event.event_date}
              initialTimeValue={event.event_time}
            />

            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch
                id="edit-show-attendees"
                name="show_attendees"
                checked={showAttendees}
                onCheckedChange={setShowAttendees}
                value="true"
              />
              <Label htmlFor="edit-show-attendees" className="cursor-pointer">
                Show attendees publicly
              </Label>
            </div>

            <div className="sm:col-span-2 flex items-center gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save changes"}
              </Button>

              {status === "success" && (
                <Badge variant="secondary" className="gap-1 py-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Saved
                </Badge>
              )}
            </div>
          </form>

          {status === "error" && errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      )}
    </Card>
  );
}
