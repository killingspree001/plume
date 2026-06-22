# Plume

A warm, shared workspace for notes and to-dos. Jot something on one device and
it appears on every other in real time. Share a board by link and a collaborator
sees your edits land as you type, along with who else is currently on the board.

Built with **Next.js (App Router)**, **Firebase** (Authentication + Firestore's
real-time listeners) and **Tailwind CSS**. Deploys free on Vercel, and Firebase's
free tier stays awake, so a live demo link keeps working.

## Features

- Email/password accounts; your boards follow you to any device
- Boards you can name and color, holding notes and tickable to-dos together
- **Real-time sync** — every change streams to all open clients instantly
- **Live presence** — see who else is on a board right now
- **Share by link** — flip a board to shared and anyone with the link can edit
- Firestore security rules enforce ownership and sharing on the server

## See the real-time part

Sign in, open a board, then open the same board in a second browser window (or
on your phone). Type in one — it appears in the other immediately. Turn on
sharing and a second account can join the same board and edit alongside you.

## Getting started

### 1. Create a Firebase project

1. Open the [Firebase console](https://console.firebase.google.com) and add a
   project (Analytics optional).
2. **Build → Authentication → Get started**, then enable **Email/Password**.
3. **Build → Firestore Database → Create database** in production mode.

### 2. Add the security rules

In **Firestore Database → Rules**, paste the contents of
[`firestore.rules`](firestore.rules) and click **Publish**.

### 3. Add your config

In **Project settings → General → Your apps**, register a web app and copy the
config. Copy `.env.example` to `.env.local` and fill it in:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 4. Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000, create an account, and make your first board.

## Deploying to Vercel

1. Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new).
2. Add the six `NEXT_PUBLIC_FIREBASE_*` environment variables.
3. Deploy, then add your Vercel domain under Firebase **Authentication →
   Settings → Authorized domains**.
