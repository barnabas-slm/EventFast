"use client";

import { Link2 } from "lucide-react";
import { useState } from "react";

type CopyLinkButtonProps = {
  eventId: string;
};

export function CopyLinkButton({ eventId }: CopyLinkButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  const handleCopy = async () => {
    try {
      const eventUrl = `${window.location.origin}/e/${eventId}`;
      await navigator.clipboard.writeText(eventUrl);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("failed");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
    >
      <Link2 className="h-4 w-4" />
      {status === "copied"
        ? "Copied"
        : status === "failed"
          ? "Copy failed"
          : "Copy Link"}
    </button>
  );
}
