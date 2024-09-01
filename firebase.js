// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "inventory-management-offbeats.firebaseapp.com",
  projectId: "inventory-management-offbeats",
  storageBucket: "inventory-management-offbeats.appspot.com",
  messagingSenderId: "576996065549",
  appId: "1:576996065549:web:3dd64257bafcd570acb044",
  measurementId: "G-TQRQJRCGY2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export{firestore};