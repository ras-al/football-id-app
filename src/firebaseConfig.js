import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDjtkdLMxR7yZ5vCgVySkjN4dqw2I7Ot2U",
  authDomain: "usercardapp-a33dc.firebaseapp.com",
  projectId: "usercardapp-a33dc",
  storageBucket: "usercardapp-a33dc.appspot.com", // Corrected this line
  messagingSenderId: "630379659037",
  appId: "1:630379659037:web:d22426a35a0d69e9bbebf4",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
