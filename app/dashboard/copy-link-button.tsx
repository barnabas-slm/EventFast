"use client";

import { Link2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

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
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      <Link2 className="h-4 w-4" />
      {status === "copied"
        ? "Link Copied"
        : status === "failed"
          ? "Copy failed"
          : "Share"}
    </Button>
  );
}
