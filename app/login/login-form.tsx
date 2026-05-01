"use client";

import { useState, useTransition } from "react";

import { signIn } from "@/app/actions";

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
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-700">Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none ring-emerald-200 transition focus:ring"
          placeholder="you@example.com"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Sending link..." : "Send magic link"}
      </button>

      {successMessage && (
        <p className="text-sm font-medium text-emerald-700">{successMessage}</p>
      )}

      {errorMessage && <p className="text-sm font-medium text-red-600">{errorMessage}</p>}
    </form>
  );
}
