// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBhnhEpPCuabwDFad74PyB-X7zSr4-27p0",
  authDomain: "colorfy-535230.firebaseapp.com",
  projectId: "colorfy-535230",
  storageBucket: "colorfy-535230.firebasestorage.app",
  messagingSenderId: "680488180180",
  appId: "1:680488180180:web:d63b76454d49cc9617de41",
  measurementId: "G-DEFSFBGGQW"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
