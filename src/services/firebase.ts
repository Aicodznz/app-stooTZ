import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Credentials provided in user request
export const firebaseConfig = {
  apiKey: "AIzaSyBjZc00HFXiBgO0NYrj1_nZelPOELgyJVc",
  authDomain: "kanzu2-5a6fe.firebaseapp.com",
  databaseURL: "https://kanzu2-5a6fe-default-rtdb.firebaseio.com",
  projectId: "kanzu2-5a6fe",
  storageBucket: "kanzu2-5a6fe.firebasestorage.app",
  messagingSenderId: "519222725725",
  appId: "1:519222725725:web:ce2fdb261e907b427351b4"
};

export const ADMIN_EMAIL = 'amytzee@gmail.com';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
