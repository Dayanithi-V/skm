import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  deleteDoc,
  doc,
  setDoc,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import type { Habit } from '@/components/habit-tracker'

// Create a new habit
export async function createHabit(habit: Omit<Habit, "id" | "completedDates">, userId: string) {
  const habitsRef = collection(db, 'habits')
  const docRef = await addDoc(habitsRef, {
    ...habit,
    userId,
    createdAt: Timestamp.now(),
    completedDates: []
  })
  
  return {
    id: docRef.id,
    ...habit,
    completedDates: []
  }
}

// Get all habits for a user
export async function getUserHabits(userId: string) {
  const habitsRef = collection(db, 'habits')
  const q = query(habitsRef, where("userId", "==", userId))
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Habit[]
}

// Toggle habit completion
export async function toggleHabitCompletion(habitId: string, date: string) {
  const habitRef = doc(db, 'habits', habitId)
  const habitDoc = await getDocs(query(collection(db, 'habits'), where("id", "==", habitId)))
  const habit = habitDoc.docs[0].data()
  
  const completedDates = habit.completedDates || []
  const updatedDates = completedDates.includes(date)
    ? completedDates.filter((d: string) => d !== date)
    : [...completedDates, date]
  
  await setDoc(habitRef, { completedDates: updatedDates }, { merge: true })
  return updatedDates
}

// Delete a habit
export async function deleteHabit(habitId: string) {
  const habitRef = doc(db, 'habits', habitId)
  await deleteDoc(habitRef)
} 