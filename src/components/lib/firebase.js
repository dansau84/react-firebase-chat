import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const apiKey = import.meta.env.VITE_API_KEY || "AIzaSyANp8R5xCHY7GCtv0YWEbg1KxQ5_yCu_Vg";

const firebaseConfig = {
  apiKey,
  authDomain: "reactchat-c1e15.firebaseapp.com",
  projectId: "reactchat-c1e15",
  storageBucket: "reactchat-c1e15.appspot.com",
  messagingSenderId: "97334090764",
  appId: "1:97334090764:web:9dfba5e4910179b8b8e229"
};

console.log("API KEY usada:", apiKey);

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
