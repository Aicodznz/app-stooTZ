import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Credentials provided in user request
export const firebaseConfig = {
  apiKey: "AIzaSyD7qJ4wHtx0vrZZylVOXnDEIv5SxHIdjic",
  authDomain: "codtz-1db32.firebaseapp.com",
  databaseURL: "https://codtz-1db32-default-rtdb.firebaseio.com",
  projectId: "codtz-1db32",
  storageBucket: "codtz-1db32.firebasestorage.app",
  messagingSenderId: "1035797221399",
  appId: "1:1035797221399:web:fbd752e36c99fdedefcc52"
};

export const ADMIN_EMAIL = 'amytzee@gmail.com';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
