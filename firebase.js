import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBN9h6OSC4FwWT4f98MwIibm9jXwpC74yU",
  authDomain: "discount-hunter-f1c22.firebaseapp.com",
  projectId: "discount-hunter-f1c22",
  storageBucket: "discount-hunter-f1c22.firebasestorage.app",
  messagingSenderId: "899570412672",
  appId: "1:899570412672:web:edeceae7ea74858fb08a65",
  measurementId: "G-3WSM25F28H"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };