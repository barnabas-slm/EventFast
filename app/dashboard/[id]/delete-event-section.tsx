"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteEvent } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DeleteEventSectionProps = {
  eventId: string;
  eventTitle: string;
};

export function DeleteEventSection({ eventId, eventTitle }: DeleteEventSectionProps) {
  const router = useRouter();
  const [confirmationTitle, setConfirmationTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    setErrorMessage("");

    startTransition(async () => {
      try {
        await deleteEvent(eventId, confirmationTitle);
        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Could not delete this event.");
      }
    });
  };

  return (
    <Card className="border border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          This permanently deletes the event and all attendees. Type the event title to confirm.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="delete-confirmation-title">Type: {eventTitle}</Label>
          <Input
            id="delete-confirmation-title"
            value={confirmationTitle}
            onChange={(event) => setConfirmationTitle(event.target.value)}
            placeholder="Enter event title"
          />
        </div>

        <div>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
            <Trash2 className="h-4 w-4" />
            {isPending ? "Deleting..." : "Delete event"}
          </Button>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
