import { 
  collection, 
  addDoc, 
  updateDoc, 
  getDocs, 
  doc, 
  query, 
  where,
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import { Habit } from "@/types/habits";

// Add a new habit
export async function addHabit(userId: string, habitName: string): Promise<string> {
  try {
    const habitsRef = collection(db, "habits");
    const newHabit = {
      name: habitName,
      completed: false,
      createdAt: serverTimestamp(),
      userId: userId
    };

    const docRef = await addDoc(habitsRef, newHabit);
    return docRef.id;
  } catch (error) {
    console.error("Error adding habit:", error);
    throw new Error("Failed to add habit");
  }
}

// Mark a habit as completed
export async function completeHabit(habitId: string): Promise<void> {
  try {
    const habitRef = doc(db, "habits", habitId);
    await updateDoc(habitRef, {
      completed: true,
      completedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error completing habit:", error);
    throw new Error("Failed to complete habit");
  }
}

// Get all habits for a user
export async function getHabits(userId: string): Promise<Habit[]> {
  try {
    const habitsRef = collection(db, "habits");
    const q = query(habitsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp).toDate(),
      completedAt: doc.data().completedAt 
        ? (doc.data().completedAt as Timestamp).toDate() 
        : undefined
    })) as Habit[];
  } catch (error) {
    console.error("Error getting habits:", error);
    throw new Error("Failed to get habits");
  }
} 