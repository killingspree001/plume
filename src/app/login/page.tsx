"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { clientAuth } from "@/lib/firebase";
import { createProfile } from "@/lib/db";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const signingUp = mode === "signup";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();

    try {
      const auth = clientAuth();
      if (signingUp) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name || email });
        await createProfile(cred.user.uid, email, name || email);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.replace("/boards");
    } catch (err) {
      setError(readableError(err));
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="px-6 py-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-clay-500 font-display text-lg font-semibold text-paper">
            P
          </span>
          <span className="font-display text-xl font-semibold text-ink">Plume</span>
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
            {signingUp ? "Make a Plume account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-ink/60">
            {signingUp
              ? "A warm little home for your notes and lists."
              : "Pick up right where you left off."}
          </p>

          <form
            onSubmit={onSubmit}
            className="mt-8 space-y-4 rounded-3xl border border-ink/10 bg-paper p-7 shadow-sm"
          >
            {signingUp && (
              <Field label="Your name">
                <input
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                  className={input}
                />
              </Field>
            )}

            <Field label="Email">
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={input}
              />
            </Field>

            <Field label="Password">
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete={signingUp ? "new-password" : "current-password"}
                  placeholder="At least 6 characters"
                  className={`${input} pr-11`}
                />
                <PasswordToggle
                  shown={showPassword}
                  onClick={() => setShowPassword((v) => !v)}
                />
              </div>
            </Field>

            {error && (
              <p className="rounded-xl bg-clay-50 px-4 py-2.5 text-sm text-clay-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-clay-500 py-3 font-semibold text-paper transition hover:bg-clay-600 disabled:opacity-60"
            >
              {busy ? "One moment…" : signingUp ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink/60">
            {signingUp ? "Already have an account?" : "New to Plume?"}{" "}
            <button
              onClick={() => {
                setMode(signingUp ? "signin" : "signup");
                setError(null);
              }}
              className="font-semibold text-clay-600 hover:text-clay-700"
            >
              {signingUp ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const input =
  "w-full rounded-xl border border-ink/15 bg-cream/60 px-4 py-2.5 text-ink outline-none transition focus:border-clay-400 focus:bg-paper focus:ring-2 focus:ring-clay-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink/80">{label}</span>
      {children}
    </label>
  );
}

function PasswordToggle({
  shown,
  onClick,
}: {
  shown: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={shown ? "Hide password" : "Show password"}
      className="absolute inset-y-0 right-3 flex items-center text-ink/40 transition hover:text-ink/70"
    >
      {shown ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
          <line x1="2" x2="22" y1="2" y2="22" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );
}

function readableError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "That email and password don't match.";
    case "auth/email-already-in-use":
      return "There's already an account with that email.";
    case "auth/weak-password":
      return "Try a password with at least 6 characters.";
    case "auth/invalid-email":
      return "That doesn't look like a valid email.";
    default:
      return "Something went wrong. Please try again.";
  }
}
