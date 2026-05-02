"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteEvent } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type DeleteEventSectionProps = {
  eventId: string;
};

export function DeleteEventSection({ eventId }: DeleteEventSectionProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleConfirmDelete = () => {
    setErrorMessage("");

    startTransition(async () => {
      try {
        await deleteEvent(eventId);
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
          Delete Event
        </CardTitle>
        <CardDescription>
          This permanently deletes the event and all attendees.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!isConfirming ? (
          <div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setIsConfirming(true);
                setErrorMessage("");
              }}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button type="button" variant="destructive" onClick={handleConfirmDelete} disabled={isPending}>
              <Trash2 className="h-4 w-4" />
              {isPending ? "Deleting..." : "Confirm delete"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!isPending) {
                  setIsConfirming(false);
                  setErrorMessage("");
                }
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        )}

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
