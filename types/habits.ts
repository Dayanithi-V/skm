export interface Habit {
  id?: string;
  name: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  userId: string;
} 