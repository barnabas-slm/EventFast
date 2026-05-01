"use client";

import { useState, useTransition } from "react";

import { signIn } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    startTransition(async () => {
      try {
        await signIn(email);
        setSuccessMessage("Check your email for a login link!");
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to send login link.",
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="you@example.com"
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Sending link..." : "Send login link"}
      </Button>

      {successMessage && (
        <Alert>
          <AlertDescription className="text-emerald-700">{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
