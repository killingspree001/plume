"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { createBoard, deleteBoard, watchOwnedBoards } from "@/lib/db";
import { ACCENTS, accentHex, relativeTime } from "@/lib/accents";
import type { AccentKey, Board } from "@/lib/types";

export default function BoardsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const stop = watchOwnedBoards(user.uid, (next) => {
      setBoards(next);
      setLoading(false);
    });
    return stop;
  }, [user]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Your boards
          </h1>
          <p className="mt-1 text-ink/60">
            A place for every list, note and stray thought.
          </p>
        </div>
        <button
          onClick={() => setComposing((v) => !v)}
          className="shrink-0 self-start rounded-full bg-clay-500 px-5 py-2.5 font-semibold text-paper shadow-sm transition hover:bg-clay-600 sm:self-auto"
        >
          {composing ? "Close" : "New board"}
        </button>
      </div>

      {composing && (
        <NewBoard
          onCreate={async (title, accent) => {
            const id = await createBoard(title, accent);
            router.push(`/boards/${id}`);
          }}
        />
      )}

      {loading ? (
        <p className="py-16 text-center text-ink/40">Loading your boards…</p>
      ) : boards.length === 0 ? (
        <Empty onStart={() => setComposing(true)} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      )}
    </div>
  );
}

function BoardCard({ board }: { board: Board }) {
  async function remove(e: React.MouseEvent) {
    e.preventDefault();
    if (confirm(`Delete "${board.title}" and everything on it?`)) {
      await deleteBoard(board.id);
    }
  }

  return (
    <Link
      href={`/boards/${board.id}`}
      className="group block overflow-hidden rounded-3xl border border-ink/10 bg-paper shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="h-3" style={{ backgroundColor: accentHex(board.accent) }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-xl font-semibold text-ink">
            {board.title}
          </h3>
          <button
            onClick={remove}
            className="text-xs font-semibold text-ink/30 opacity-0 transition hover:text-clay-600 group-hover:opacity-100"
          >
            Delete
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-ink/50">
          <span>Updated {relativeTime(board.updatedAt)}</span>
          {board.shared && (
            <span className="rounded-full bg-honey-100 px-2 py-0.5 font-semibold text-honey-500">
              Shared
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function NewBoard({
  onCreate,
}: {
  onCreate: (title: string, accent: AccentKey) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [accent, setAccent] = useState<AccentKey>("clay");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await onCreate(title.trim(), accent);
    } catch {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mb-8 rounded-3xl border border-ink/10 bg-paper p-6 shadow-sm"
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        placeholder="Name your board…"
        className="w-full bg-transparent font-display text-2xl font-semibold text-ink outline-none placeholder:text-ink/30"
      />
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {ACCENTS.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => setAccent(a.key)}
              aria-label={a.label}
              style={{ backgroundColor: a.hex }}
              className={`h-7 w-7 rounded-full transition ${
                accent === a.key
                  ? "ring-2 ring-ink ring-offset-2 ring-offset-paper"
                  : "hover:scale-110"
              }`}
            />
          ))}
        </div>
        <button
          type="submit"
          disabled={busy || !title.trim()}
          className="rounded-full bg-clay-500 px-5 py-2 font-semibold text-paper transition hover:bg-clay-600 disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create board"}
        </button>
      </div>
    </form>
  );
}

function Empty({ onStart }: { onStart: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-ink/20 bg-paper/60 py-20 text-center">
      <p className="font-display text-2xl font-semibold text-ink">
        Nothing here yet
      </p>
      <p className="mx-auto mt-2 max-w-xs text-ink/60">
        Make your first board and start jotting things down.
      </p>
      <button
        onClick={onStart}
        className="mt-6 rounded-full bg-clay-500 px-6 py-2.5 font-semibold text-paper transition hover:bg-clay-600"
      >
        Create a board
      </button>
    </div>
  );
}
