"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { clientAuth } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";

export default function AppHeader() {
  const { profile } = useAuth();
  const router = useRouter();

  async function leave() {
    await signOut(clientAuth());
    router.replace("/login");
  }

  const name = profile?.name ?? profile?.email ?? "You";

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
        <Link href="/boards" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-clay-500 font-display text-lg font-semibold text-paper">
            P
          </span>
          <span className="font-display text-lg font-semibold text-ink">Plume</span>
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-ink/60 sm:inline">{name}</span>
          <button
            onClick={leave}
            className="rounded-full border border-ink/15 px-4 py-1.5 font-semibold text-ink/70 transition hover:bg-ink/5 hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
