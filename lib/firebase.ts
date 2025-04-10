import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
  initializeAuth,
  indexedDBLocalPersistence,
  AuthErrorCodes,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDewvY2Qiv8DyGCFqfnQmwsIXlV2d7qlj4",
  authDomain: "habit-tracker-9f8f5.firebaseapp.com",
  databaseURL: "https://habit-tracker-9f8f5-default-rtdb.firebaseio.com",
  projectId: "habit-tracker-9f8f5",
  storageBucket: "habit-tracker-9f8f5.firebasestorage.app",
  messagingSenderId: "798206151303",
  appId: "1:798206151303:web:679c31d1c5ce8d97b64622",
  measurementId: "G-KG09B35N9S"
};

// Initialize Firebase with optimized settings
const app = initializeApp(firebaseConfig);

// Initialize auth with optimized persistence
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserSessionPersistence]
});

export const database = getDatabase(app);

// Optimized registration function
export async function registerUser(email: string, password: string, username: string) {
  try {
    // Create the user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Sign out immediately after creation
    await signOut(auth);
    
    return userCredential.user;
  } catch (error: any) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        throw new Error("This email is already registered. Please login instead.");
      case 'auth/invalid-email':
        throw new Error("Please enter a valid email address.");
      case 'auth/weak-password':
        throw new Error("Password should be at least 6 characters long.");
      default:
        throw new Error("Registration failed. Please try again.");
    }
  }
}

// Optimized login function with performance improvements
export async function loginUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    // Enhanced error handling with specific messages
    switch (error.code) {
      case 'auth/user-not-found':
        error.message = "No account found with this email. Please sign up first.";
        throw error;
      case 'auth/wrong-password':
        error.message = "Incorrect password. Please try again.";
        throw error;
      case 'auth/invalid-email':
        error.message = "Please enter a valid email address.";
        throw error;
      case 'auth/too-many-requests':
        error.message = "Too many failed attempts. Please try again later.";
        throw error;
      default:
        error.message = "Login failed. Please check your credentials.";
        throw error;
    }
  }
}

// Add password reset function
export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: window.location.origin + '/login', // Redirect URL after password reset
      handleCodeInApp: true,
    });
    return true;
  } catch (error: any) {
    switch (error.code) {
      case 'auth/user-not-found':
        throw new Error("No account exists with this email address.");
      case 'auth/invalid-email':
        throw new Error("Please enter a valid email address.");
      default:
        throw new Error("Failed to send reset email. Please try again.");
    }
  }
} 