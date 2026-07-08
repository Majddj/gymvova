export type ExerciseType =
  | 'pushups'
  | 'pullups'
  | 'squats'
  | 'situps'
  | 'dips'
  | 'plank'
  | 'lunges'
  | 'custom';

export interface Exercise {
  id: string;
  type: ExerciseType;
  name: string;
  icon: string;
  unit: 'reps' | 'seconds';
  isCustom: boolean;
}

export interface WorkoutLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  date: string;       // "YYYY-MM-DD"
  reps: number;
  sets: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}
