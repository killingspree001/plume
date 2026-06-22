import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { clientAuth, clientDb } from "./firebase";
import type { AccentKey, Board, Card, Presence, Profile } from "./types";

function millis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "number") return value;
  return Date.now();
}

function me() {
  return clientAuth().currentUser;
}

// --- Profiles -------------------------------------------------------------

export async function createProfile(uid: string, email: string, name: string) {
  await setDoc(doc(clientDb(), "users", uid), {
    email,
    name,
    createdAt: serverTimestamp(),
  });
}

export function readProfile(
  uid: string,
  data: Record<string, unknown> | undefined,
  fallbackEmail: string | null
): Profile {
  return {
    id: uid,
    email: (data?.email as string) ?? fallbackEmail,
    name: (data?.name as string) ?? null,
  };
}

// --- Boards ---------------------------------------------------------------

export function watchOwnedBoards(uid: string, cb: (boards: Board[]) => void) {
  const q = query(
    collection(clientDb(), "boards"),
    where("ownerId", "==", uid)
  );
  return onSnapshot(q, (snap) => {
    const boards = snap.docs.map((d) => readBoard(d.id, d.data()));
    boards.sort((a, b) => b.updatedAt - a.updatedAt);
    cb(boards);
  });
}

export function watchBoard(boardId: string, cb: (board: Board | null) => void) {
  return onSnapshot(doc(clientDb(), "boards", boardId), (snap) => {
    cb(snap.exists() ? readBoard(snap.id, snap.data()) : null);
  });
}

function readBoard(id: string, data: Record<string, unknown>): Board {
  return {
    id,
    title: (data.title as string) ?? "Untitled",
    ownerId: data.ownerId as string,
    ownerName: (data.ownerName as string) ?? null,
    accent: (data.accent as AccentKey) ?? "clay",
    shared: Boolean(data.shared),
    createdAt: millis(data.createdAt),
    updatedAt: millis(data.updatedAt),
  };
}

export async function createBoard(title: string, accent: AccentKey) {
  const user = me();
  const ref = await addDoc(collection(clientDb(), "boards"), {
    title,
    accent,
    ownerId: user?.uid ?? null,
    ownerName: user?.displayName ?? user?.email ?? null,
    shared: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function renameBoard(boardId: string, title: string) {
  await updateDoc(doc(clientDb(), "boards", boardId), {
    title,
    updatedAt: serverTimestamp(),
  });
}

export async function setBoardShared(boardId: string, shared: boolean) {
  await updateDoc(doc(clientDb(), "boards", boardId), {
    shared,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBoard(boardId: string) {
  await deleteDoc(doc(clientDb(), "boards", boardId));
}

export async function getBoardOnce(boardId: string): Promise<Board | null> {
  const snap = await getDoc(doc(clientDb(), "boards", boardId));
  return snap.exists() ? readBoard(snap.id, snap.data()) : null;
}

// --- Cards (the live part) ------------------------------------------------

export function watchCards(boardId: string, cb: (cards: Card[]) => void) {
  const q = query(
    collection(clientDb(), "boards", boardId, "cards"),
    orderBy("order", "asc")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => readCard(d.id, d.data())));
  });
}

function readCard(id: string, data: Record<string, unknown>): Card {
  return {
    id,
    text: (data.text as string) ?? "",
    kind: (data.kind as Card["kind"]) ?? "note",
    done: Boolean(data.done),
    order: (data.order as number) ?? 0,
    authorName: (data.authorName as string) ?? null,
    createdAt: millis(data.createdAt),
    updatedAt: millis(data.updatedAt),
  };
}

export async function addCard(
  boardId: string,
  text: string,
  kind: Card["kind"]
) {
  const user = me();
  await addDoc(collection(clientDb(), "boards", boardId, "cards"), {
    text,
    kind,
    done: false,
    order: Date.now(),
    authorName: user?.displayName ?? user?.email ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await touchBoard(boardId);
}

export async function updateCard(
  boardId: string,
  cardId: string,
  patch: Partial<Pick<Card, "text" | "done">>
) {
  await updateDoc(doc(clientDb(), "boards", boardId, "cards", cardId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCard(boardId: string, cardId: string) {
  await deleteDoc(doc(clientDb(), "boards", boardId, "cards", cardId));
}

async function touchBoard(boardId: string) {
  await updateDoc(doc(clientDb(), "boards", boardId), {
    updatedAt: serverTimestamp(),
  }).catch(() => {});
}

// --- Presence (who else is here) ------------------------------------------

export function watchPresence(boardId: string, cb: (people: Presence[]) => void) {
  return onSnapshot(
    collection(clientDb(), "boards", boardId, "presence"),
    (snap) => {
      const cutoff = Date.now() - 45_000;
      const people = snap.docs
        .map((d) => ({
          id: d.id,
          name: (d.data().name as string) ?? "Someone",
          lastActive: millis(d.data().lastActive),
        }))
        .filter((p) => p.lastActive >= cutoff);
      cb(people);
    }
  );
}

export async function announcePresence(boardId: string, name: string) {
  const user = me();
  if (!user) return;
  await setDoc(doc(clientDb(), "boards", boardId, "presence", user.uid), {
    name,
    lastActive: serverTimestamp(),
  });
}

export async function clearPresence(boardId: string) {
  const user = me();
  if (!user) return;
  await deleteDoc(
    doc(clientDb(), "boards", boardId, "presence", user.uid)
  ).catch(() => {});
}
