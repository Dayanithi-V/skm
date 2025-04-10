"use client";

import { useEffect, useState } from 'react';
import { database, auth } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { addHabit, completeHabit, deleteHabit } from '@/lib/habits';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Habit {
  id: string;
  name: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export default function HabitManager() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const habitsRef = ref(database, `habits/${user.uid}`);
    
    // Set up real-time listener
    const unsubscribe = onValue(habitsRef, (snapshot) => {
      if (snapshot.exists()) {
        const habitsData = snapshot.val();
        const habitsArray = Object.entries(habitsData).map(([id, data]) => ({
          id,
          ...(data as Omit<Habit, 'id'>)
        }));
        setHabits(habitsArray);
      } else {
        setHabits([]);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim()) return;

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Must be logged in");

      await addHabit(user.uid, newHabit.trim());
      setNewHabit('');
      toast.success("Habit added successfully!");
    } catch (error) {
      toast.error("Failed to add habit");
      console.error(error);
    }
  };

  const handleCompleteHabit = async (habitId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Must be logged in");

      await completeHabit(user.uid, habitId);
      toast.success("Habit marked as completed!");
    } catch (error) {
      toast.error("Failed to complete habit");
      console.error(error);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Must be logged in");

      await deleteHabit(user.uid, habitId);
      toast.success("Habit deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete habit");
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading habits...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <form onSubmit={handleAddHabit} className="mb-6 flex gap-2">
        <Input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Enter a new habit"
          className="flex-1"
        />
        <Button type="submit">Add Habit</Button>
      </form>

      <div className="space-y-4">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
          >
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={habit.completed}
                onChange={() => !habit.completed && handleCompleteHabit(habit.id)}
                className="w-5 h-5"
              />
              <span className={habit.completed ? 'line-through text-gray-500' : ''}>
                {habit.name}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteHabit(habit.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
        {habits.length === 0 && (
          <p className="text-center text-gray-500">No habits added yet</p>
        )}
      </div>
    </div>
  );
} 