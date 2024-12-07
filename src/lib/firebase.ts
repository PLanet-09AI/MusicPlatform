import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDlzNy_bOY1LN-PJ0azNYg6nyFLbudfwUA",
  authDomain: "mapswinner-9376f.firebaseapp.com",
  projectId: "mapswinner-9376f",
  storageBucket: "mapswinner-9376f.appspot.com",
  messagingSenderId: "838375218090",
  appId: "1:838375218090:web:3a9805c057b12ca9d1a9d3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);