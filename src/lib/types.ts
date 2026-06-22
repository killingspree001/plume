export type Profile = {
  id: string;
  email: string | null;
  name: string | null;
};

export type Board = {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string | null;
  accent: AccentKey;
  shared: boolean;
  createdAt: number;
  updatedAt: number;
};

export type CardKind = "note" | "task";

export type Card = {
  id: string;
  text: string;
  kind: CardKind;
  done: boolean;
  order: number;
  authorName: string | null;
  createdAt: number;
  updatedAt: number;
};

export type Presence = {
  id: string;
  name: string;
  lastActive: number;
};

export type AccentKey = "clay" | "honey" | "sage" | "sky" | "plum" | "slate";
