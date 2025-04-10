import { database } from "./firebase";
import { ref, set, push, update, get, remove } from "firebase/database";

interface Habit {
  name: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

// Add a new habit
export async function addHabit(userId: string, habitName: string): Promise<string> {
  try {
    const habitsRef = ref(database, `habits/${userId}`);
    const newHabitRef = push(habitsRef);
    
    const habit: Habit = {
      name: habitName,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    await set(newHabitRef, habit);
    return newHabitRef.key as string;
  } catch (error) {
    console.error("Error adding habit:", error);
    throw new Error("Failed to add habit");
  }
}

// Get all habits for a user
export async function getHabits(userId: string) {
  try {
    const habitsRef = ref(database, `habits/${userId}`);
    const snapshot = await get(habitsRef);
    
    if (snapshot.exists()) {
      const habits = snapshot.val();
      return Object.entries(habits).map(([id, data]) => ({
        id,
        ...(data as Habit)
      }));
    }
    return [];
  } catch (error) {
    console.error("Error getting habits:", error);
    throw new Error("Failed to get habits");
  }
}

// Mark a habit as completed
export async function completeHabit(userId: string, habitId: string) {
  try {
    const habitRef = ref(database, `habits/${userId}/${habitId}`);
    await update(habitRef, {
      completed: true,
      completedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error completing habit:", error);
    throw new Error("Failed to complete habit");
  }
}

// Delete a habit
export async function deleteHabit(userId: string, habitId: string) {
  try {
    const habitRef = ref(database, `habits/${userId}/${habitId}`);
    await remove(habitRef);
  } catch (error) {
    console.error("Error deleting habit:", error);
    throw new Error("Failed to delete habit");
  }
}

// Update a habit
export async function updateHabit(userId: string, habitId: string, updates: Partial<Habit>) {
  try {
    const habitRef = ref(database, `habits/${userId}/${habitId}`);
    await update(habitRef, updates);
  } catch (error) {
    console.error("Error updating habit:", error);
    throw new Error("Failed to update habit");
  }
} 