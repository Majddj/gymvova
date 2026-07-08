export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Goal {
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseIcon: string;
  targetReps: number;
  period: GoalPeriod;
  startDate: string;   // "YYYY-MM-DD"
  endDate: string;     // "YYYY-MM-DD"
  isActive: boolean;
  createdAt: string;
}
