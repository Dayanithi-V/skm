import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Habit-related database functions
export async function createHabit(habit: Omit<Habit, "id" | "completedDates">, userId: string) {
  const { data, error } = await supabase
    .from('habits')
    .insert([
      {
        name: habit.name,
        description: habit.description,
        frequency: habit.frequency,
        user_id: userId,
        color: habit.color
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserHabits(userId: string) {
  // First get all habits
  const { data: habits, error: habitsError } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)

  if (habitsError) throw habitsError

  // Then get all completions for these habits
  const { data: completions, error: completionsError } = await supabase
    .from('habit_completions')
    .select('*')
    .eq('user_id', userId)

  if (completionsError) throw completionsError

  // Combine the data
  return habits.map(habit => ({
    ...habit,
    completedDates: completions
      .filter(c => c.habit_id === habit.id)
      .map(c => c.completed_date)
  }))
}

export async function toggleHabitCompletion(habitId: string, userId: string, date: string) {
  // Check if completion exists
  const { data: existing, error: checkError } = await supabase
    .from('habit_completions')
    .select('*')
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .eq('completed_date', date)
    .single()

  if (checkError && checkError.code !== 'PGRST116') throw checkError // PGRST116 means no rows returned

  if (existing) {
    // Delete if exists
    const { error: deleteError } = await supabase
      .from('habit_completions')
      .delete()
      .eq('id', existing.id)

    if (deleteError) throw deleteError
  } else {
    // Insert if doesn't exist
    const { error: insertError } = await supabase
      .from('habit_completions')
      .insert([
        {
          habit_id: habitId,
          user_id: userId,
          completed_date: date
        }
      ])

    if (insertError) throw insertError
  }
}

export async function deleteHabit(habitId: string, userId: string) {
  // Delete all completions first
  const { error: completionsError } = await supabase
    .from('habit_completions')
    .delete()
    .eq('habit_id', habitId)
    .eq('user_id', userId)

  if (completionsError) throw completionsError

  // Then delete the habit
  const { error: habitError } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId)
    .eq('user_id', userId)

  if (habitError) throw habitError
}