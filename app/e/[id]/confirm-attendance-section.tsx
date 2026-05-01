"use client";

import { CheckCircle2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { confirmAttendance } from "@/app/actions";

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
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
        Confirm Attendance
      </h2>
      <p className="mt-1 text-sm text-zinc-600">
        Let the host know you are coming.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setIsOpen((open) => !open);
            setStatus("idle");
            setErrorMessage("");
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
        >
          <UserPlus className="h-4 w-4" />
          {isOpen ? "Cancel" : "I am attending"}
        </button>

        {status === "success" && (
          <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Success
          </span>
        )}
      </div>

      {isOpen && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-emerald-200 transition focus:ring sm:max-w-sm"
          />
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Confirming..." : "Confirm"}
          </button>
        </div>
      )}

      {status === "error" && errorMessage && (
        <p className="mt-3 text-sm font-medium text-red-600">{errorMessage}</p>
      )}
    </section>
  );
}
