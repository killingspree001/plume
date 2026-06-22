"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import {
  addCard,
  announcePresence,
  clearPresence,
  deleteCard,
  renameBoard,
  setBoardShared,
  updateCard,
  watchBoard,
  watchCards,
  watchPresence,
} from "@/lib/db";
import { accentHex } from "@/lib/accents";
import type { Board, Card, CardKind, Presence } from "@/lib/types";

export default function BoardPage() {
  const params = useParams();
  const id = String(params.id);
  const { user, profile } = useAuth();

  const [board, setBoard] = useState<Board | null | undefined>(undefined);
  const [cards, setCards] = useState<Card[]>([]);
  const [people, setPeople] = useState<Presence[]>([]);

  const myName = profile?.name ?? user?.email ?? "You";

  useEffect(() => watchBoard(id, setBoard), [id]);
  useEffect(() => watchCards(id, setCards), [id]);
  useEffect(() => watchPresence(id, setPeople), [id]);

  // Heartbeat so others can see we're on the board, cleared when we leave.
  useEffect(() => {
    if (!user) return;
    announcePresence(id, myName);
    const beat = setInterval(() => announcePresence(id, myName), 15000);
    return () => {
      clearInterval(beat);
      clearPresence(id);
    };
  }, [id, user, myName]);

  if (board === undefined) {
    return <p className="py-20 text-center text-ink/40">Opening board…</p>;
  }

  if (board === null) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-2xl font-semibold text-ink">
          This board isn&apos;t available
        </p>
        <p className="mt-2 text-ink/60">
          It may have been deleted, or it isn&apos;t shared with you.
        </p>
        <Link
          href="/boards"
          className="mt-6 inline-block rounded-full bg-clay-500 px-5 py-2.5 font-semibold text-paper hover:bg-clay-600"
        >
          Back to your boards
        </Link>
      </div>
    );
  }

  const isOwner = board.ownerId === user?.uid;

  return (
    <div>
      <Link
        href="/boards"
        className="mb-5 inline-block text-sm font-semibold text-ink/50 hover:text-ink"
      >
        ← All boards
      </Link>

      <BoardHeader
        board={board}
        isOwner={isOwner}
        people={people}
        myId={user?.uid ?? ""}
      />

      <Composer onAdd={(text, kind) => addCard(id, text, kind)} />

      <CardGrid boardId={id} cards={cards} />
    </div>
  );
}

function BoardHeader({
  board,
  isOwner,
  people,
  myId,
}: {
  board: Board;
  isOwner: boolean;
  people: Presence[];
  myId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(board.title);
  const [copied, setCopied] = useState(false);

  useEffect(() => setTitle(board.title), [board.title]);

  async function save() {
    setEditing(false);
    const trimmed = title.trim();
    if (trimmed && trimmed !== board.title) await renameBoard(board.id, trimmed);
    else setTitle(board.title);
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="h-9 w-2.5 rounded-full"
            style={{ backgroundColor: accentHex(board.accent) }}
          />
          {editing && isOwner ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={save}
              onKeyDown={(e) => e.key === "Enter" && save()}
              autoFocus
              className="w-full min-w-0 bg-transparent font-display text-2xl font-semibold text-ink outline-none sm:text-3xl"
            />
          ) : (
            <h1
              onClick={() => isOwner && setEditing(true)}
              className={`font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl ${
                isOwner ? "cursor-text" : ""
              }`}
            >
              {board.title}
            </h1>
          )}
        </div>

        <PresenceBar people={people} myId={myId} />
      </div>

      {isOwner && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink/70">
            <input
              type="checkbox"
              checked={board.shared}
              onChange={(e) => setBoardShared(board.id, e.target.checked)}
              className="h-4 w-4 accent-clay-500"
            />
            Anyone with the link can edit
          </label>
          {board.shared && (
            <button
              onClick={copyLink}
              className="rounded-full border border-ink/15 px-4 py-1.5 text-sm font-semibold text-ink/70 transition hover:bg-ink/5"
            >
              {copied ? "Link copied ✓" : "Copy link"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PresenceBar({ people, myId }: { people: Presence[]; myId: string }) {
  const others = people.filter((p) => p.id !== myId);
  if (others.length === 0) {
    return <span className="text-sm text-ink/40">Only you</span>;
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {others.slice(0, 4).map((p, i) => (
          <span
            key={p.id}
            title={p.name}
            style={{ marginLeft: i === 0 ? 0 : -8 }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-honey-400 text-sm font-bold text-paper ring-2 ring-cream"
          >
            {p.name.charAt(0).toUpperCase()}
          </span>
        ))}
      </div>
      <span className="text-sm text-ink/50">
        {others.length} other{others.length === 1 ? "" : "s"} here
      </span>
    </div>
  );
}

function Composer({
  onAdd,
}: {
  onAdd: (text: string, kind: CardKind) => Promise<void>;
}) {
  const [kind, setKind] = useState<CardKind>("note");
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setText("");
    inputRef.current?.focus();
    await onAdd(value, kind);
  }

  return (
    <form
      onSubmit={submit}
      className="mb-8 rounded-2xl border border-ink/10 bg-paper p-2.5 shadow-sm sm:p-3"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex self-start rounded-full bg-cream p-1 text-sm font-semibold">
          {(["note", "task"] as CardKind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`rounded-full px-4 py-1 capitalize transition sm:px-3 ${
                kind === k ? "bg-clay-500 text-paper" : "text-ink/50"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="flex flex-1 items-center gap-2">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={kind === "task" ? "Add a to-do…" : "Write a note…"}
            className="w-full min-w-0 flex-1 bg-transparent px-2 py-1.5 text-ink outline-none placeholder:text-ink/30"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="shrink-0 rounded-full bg-clay-500 px-5 py-1.5 text-sm font-semibold text-paper transition hover:bg-clay-600 disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>
    </form>
  );
}

function CardGrid({ boardId, cards }: { boardId: string; cards: Card[] }) {
  const { tasks, notes } = useMemo(
    () => ({
      tasks: cards.filter((c) => c.kind === "task"),
      notes: cards.filter((c) => c.kind === "note"),
    }),
    [cards]
  );

  if (cards.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/15 py-16 text-center text-ink/40">
        Empty for now. Add a note or a to-do above — it shows up everywhere at
        once.
      </p>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {tasks.length > 0 && (
        <section>
          <SectionTitle>To-dos</SectionTitle>
          <div className="space-y-2">
            {tasks.map((card) => (
              <TaskRow key={card.id} boardId={boardId} card={card} />
            ))}
          </div>
        </section>
      )}

      {notes.length > 0 && (
        <section>
          <SectionTitle>Notes</SectionTitle>
          <div className="columns-1 gap-3 sm:columns-2 lg:columns-1 xl:columns-2">
            {notes.map((card) => (
              <NoteCard key={card.id} boardId={boardId} card={card} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/40">
      {children}
    </h2>
  );
}

function TaskRow({ boardId, card }: { boardId: string; card: Card }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(card.text);

  async function save() {
    setEditing(false);
    const value = draft.trim();
    if (value && value !== card.text) await updateCard(boardId, card.id, { text: value });
    else setDraft(card.text);
  }

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-ink/10 bg-paper px-3 py-2.5">
      <button
        onClick={() => updateCard(boardId, card.id, { done: !card.done })}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] transition ${
          card.done
            ? "border-clay-500 bg-clay-500 text-paper"
            : "border-ink/25 text-transparent hover:border-clay-400"
        }`}
      >
        ✓
      </button>

      {editing ? (
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === "Enter" && save()}
          autoFocus
          className="flex-1 bg-transparent text-ink outline-none"
        />
      ) : (
        <span
          onClick={() => {
            setDraft(card.text);
            setEditing(true);
          }}
          className={`flex-1 cursor-text ${
            card.done ? "text-ink/40 line-through" : "text-ink"
          }`}
        >
          {card.text}
        </span>
      )}

      <button
        onClick={() => deleteCard(boardId, card.id)}
        className="text-xs font-semibold text-ink/30 opacity-0 transition hover:text-clay-600 group-hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

function NoteCard({ boardId, card }: { boardId: string; card: Card }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(card.text);

  async function save() {
    setEditing(false);
    const value = draft.trim();
    if (value && value !== card.text) await updateCard(boardId, card.id, { text: value });
    else setDraft(card.text);
  }

  return (
    <div className="group mb-3 break-inside-avoid rounded-2xl border border-ink/10 bg-paper p-4 shadow-sm">
      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          autoFocus
          rows={3}
          className="w-full resize-none bg-transparent text-ink outline-none"
        />
      ) : (
        <p
          onClick={() => {
            setDraft(card.text);
            setEditing(true);
          }}
          className="cursor-text whitespace-pre-wrap text-ink"
        >
          {card.text}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between text-xs text-ink/40">
        <span>{card.authorName ?? ""}</span>
        <button
          onClick={() => deleteCard(boardId, card.id)}
          className="font-semibold opacity-0 transition hover:text-clay-600 group-hover:opacity-100"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
