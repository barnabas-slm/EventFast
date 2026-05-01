"use client";

import { CheckCircle2, Trash2, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { addAttendeeToEvent, removeAttendeeFromEvent } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Item } from "@/components/ui/item";

type ManageAttendeesSectionProps = {
  eventId: string;
  attendees: Array<{
    id: string;
    name: string;
  }>;
};

export function ManageAttendeesSection({
  eventId,
  attendees,
}: ManageAttendeesSectionProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "added" | "removed" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [removingAttendeeId, setRemovingAttendeeId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setStatus("error");
      setErrorMessage("Please enter an attendee name.");
      return;
    }

    setStatus("idle");
    setErrorMessage("");

    startTransition(async () => {
      try {
        await addAttendeeToEvent(eventId, trimmedName);
        setName("");
        setStatus("added");
        router.refresh();
      } catch (error) {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Could not add attendee.");
      }
    });
  };

  const handleRemove = (attendeeId: string) => {
    setStatus("idle");
    setErrorMessage("");
    setRemovingAttendeeId(attendeeId);

    startTransition(async () => {
      try {
        await removeAttendeeFromEvent(eventId, attendeeId);
        setStatus("removed");
        router.refresh();
      } catch (error) {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Could not remove attendee.");
      } finally {
        setRemovingAttendeeId(null);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Users className="h-5 w-5" />
          Manage Attendees
        </CardTitle>
        <CardDescription>Add people manually or remove them from this event.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Attendee name"
            className="sm:max-w-sm"
          />
          <Button type="button" variant="outline" onClick={handleAdd} disabled={isPending}>
            <UserPlus className="h-4 w-4" />
            {isPending && !removingAttendeeId ? "Adding..." : "Add attendee"}
          </Button>

          {(status === "added" || status === "removed") && (
            <Badge variant="secondary" className="gap-1 py-1.5">
              <CheckCircle2 className="h-4 w-4" />
              {status === "added" ? "Added" : "Removed"}
            </Badge>
          )}
        </div>

        {status === "error" && errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {attendees.length === 0 ? (
          <p className="text-sm text-muted-foreground">No attendees yet.</p>
        ) : (
          <ul className="space-y-2">
            {attendees.map((attendee) => (
              <li key={attendee.id}>
                <Item variant="outline" className="justify-between gap-3">
                  <span>{attendee.name}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemove(attendee.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                    {removingAttendeeId === attendee.id ? "Removing..." : "Remove"}
                  </Button>
                </Item>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
