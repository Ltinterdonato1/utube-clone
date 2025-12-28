import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC4UN4fCS9nn6o-i39dJm770gqYasFzxEQ",
  authDomain: "utube-clone-cc717.firebaseapp.com",
  projectId: "utube-clone-cc717",
  storageBucket: "utube-clone-cc717.firebasestorage.app",
  messagingSenderId: "18970680660",
  appId: "1:18970680660:web:1f4fbc544c4f2deff4bcc1",
  measurementId: "G-QC8TYF9HP2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and Export Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configure Google Provider
export const provider = new GoogleAuthProvider();
// Forces the account picker to appear every time (helpful for testing)
provider.setCustomParameters({ prompt: 'select_account' });

// Helper function for Google Sign-In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export default app;