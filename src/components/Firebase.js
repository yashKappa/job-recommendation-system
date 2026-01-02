// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCHg3UpmOWp4IV22dIgvWbv-ta8qg4-c-E",
  authDomain: "family-chat-54406.firebaseapp.com",
  databaseURL: "https://family-chat-54406-default-rtdb.firebaseio.com",
  projectId: "family-chat-54406",
  storageBucket: "family-chat-54406.firebasestorage.app",
  messagingSenderId: "14179860934",
  appId: "1:14179860934:web:67f3fe0fc6dc95bc7632c7",
  measurementId: "G-8H95Q12D01"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
setPersistence(auth, browserLocalPersistence);
