import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";;

const firebaseConfig = {
  apiKey: "AIzaSyBhnhEpPCuabwDFad74PyB-X7zSr4-27p0",
  authDomain: "colorfy-535230.firebaseapp.com",
  projectId: "colorfy-535230",
  storageBucket: "colorfy-535230.firebasestorage.app",
  messagingSenderId: "680488180180",
  appId: "1:680488180180:web:d63b76454d49cc9617de41",
  measurementId: "G-DEFSFBGGQW"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);