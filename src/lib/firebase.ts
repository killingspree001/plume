import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let authRef: Auth | undefined;
let dbRef: Firestore | undefined;

function app_() {
  if (!app) app = getApps().length ? getApp() : initializeApp(config);
  return app;
}

// Initialised on first call so it never runs during the server prerender,
// where the public config isn't present and the SDK would throw.
export function clientAuth() {
  if (!authRef) authRef = getAuth(app_());
  return authRef;
}

export function clientDb() {
  if (!dbRef) dbRef = getFirestore(app_());
  return dbRef;
}
