"use client";

import { CheckCircle2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { confirmAttendance } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ConfirmAttendanceSectionProps = {
  eventId: string;
};

export function ConfirmAttendanceSection({
  eventId,
}: ConfirmAttendanceSectionProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setStatus("error");
      setErrorMessage("Please enter your name.");
      return;
    }

    startTransition(async () => {
      try {
        await confirmAttendance(eventId, trimmedName);
        setStatus("success");
        setErrorMessage("");
        setName("");
        setIsOpen(false);
        router.refresh();
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Could not confirm attendance.",
        );
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirm Attendance</CardTitle>
        <CardDescription>Let the host know you are coming.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={() => {
              setIsOpen((open) => !open);
              setStatus("idle");
              setErrorMessage("");
            }}
          >
            <UserPlus className="h-4 w-4" />
            {isOpen ? "Cancel" : "I am attending"}
          </Button>

          {status === "success" && (
            <Badge variant="secondary" className="gap-1 py-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Confirmed!
            </Badge>
          )}
        </div>

        {isOpen && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="sm:max-w-sm"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? "Confirming..." : "Confirm"}
            </Button>
          </div>
        )}

        {status === "error" && errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
