import { database as db } from '../firebase';
import { 
  ref,
  set,
  push,
  get,
  remove,
  query,
  orderByChild,
  equalTo
} from 'firebase/database';

interface Habit {
  id?: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  createdAt: string;
  userId: string;
}

interface HabitCompletion {
  date: string;
  completed: boolean;
}

// Add a new habit
export const addHabit = async (userId: string, habitData: Omit<Habit, 'id' | 'userId' | 'createdAt'>) => {
  try {
    const habitsRef = ref(db, `users/${userId}/habits`);
    const newHabitRef = push(habitsRef);
    
    const habit: Habit = {
      ...habitData,
      userId,
      createdAt: new Date().toISOString(),
    };

    await set(newHabitRef, habit);
    return { id: newHabitRef.key, ...habit };
  } catch (error) {
    console.error('Error adding habit:', error);
    throw error;
  }
};

// Get all habits for a user
export const getUserHabits = async (userId: string) => {
  try {
    const habitsRef = ref(db, `users/${userId}/habits`);
    const habitsQuery = query(habitsRef, orderByChild('userId'), equalTo(userId));
    const snapshot = await get(habitsQuery);
    
    if (!snapshot.exists()) {
      return [];
    }

    const habits: Habit[] = [];
    snapshot.forEach((childSnapshot) => {
      habits.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });

    return habits;
  } catch (error) {
    console.error('Error getting habits:', error);
    throw error;
  }
};

// Toggle habit completion for a specific date
export const toggleHabitCompletion = async (userId: string, habitId: string, date: string) => {
  try {
    const completionRef = ref(db, `users/${userId}/completions/${habitId}/${date}`);
    const snapshot = await get(completionRef);
    const currentValue = snapshot.val();
    
    await set(completionRef, !currentValue);
    return !currentValue;
  } catch (error) {
    console.error('Error toggling habit completion:', error);
    throw error;
  }
};

// Get completions for a habit
export const getHabitCompletions = async (userId: string, habitId: string) => {
  try {
    const completionsRef = ref(db, `users/${userId}/completions/${habitId}`);
    const snapshot = await get(completionsRef);
    
    if (!snapshot.exists()) {
      return [];
    }

    const completions: HabitCompletion[] = [];
    snapshot.forEach((childSnapshot) => {
      completions.push({
        date: childSnapshot.key!,
        completed: childSnapshot.val()
      });
    });

    return completions;
  } catch (error) {
    console.error('Error getting habit completions:', error);
    throw error;
  }
};

// Delete a habit
export const deleteHabit = async (userId: string, habitId: string) => {
  try {
    // Delete the habit
    const habitRef = ref(db, `users/${userId}/habits/${habitId}`);
    await remove(habitRef);
    
    // Delete all completions for this habit
    const completionsRef = ref(db, `users/${userId}/completions/${habitId}`);
    await remove(completionsRef);
  } catch (error) {
    console.error('Error deleting habit:', error);
    throw error;
  }
}; 
