import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Exercise, WorkoutLog } from '../types';
import { DEFAULT_EXERCISES } from '../../../shared/constants/exercises';

interface ExercisesState {
  exercises: Exercise[];
  logs: WorkoutLog[];
}

const initialState: ExercisesState = {
  exercises: DEFAULT_EXERCISES,
  logs: [],
};

const exercisesSlice = createSlice({
  name: 'exercises',
  initialState,
  reducers: {
    addLog: (state, action: PayloadAction<WorkoutLog>) => {
      state.logs.push(action.payload);
    },
    editLog: (state, action: PayloadAction<WorkoutLog>) => {
      const index = state.logs.findIndex((l) => l.id === action.payload.id);
      if (index !== -1) {
        state.logs[index] = action.payload;
      }
    },
    deleteLog: (state, action: PayloadAction<string>) => {
      state.logs = state.logs.filter((l) => l.id !== action.payload);
    },
    addCustomExercise: (state, action: PayloadAction<Exercise>) => {
      state.exercises.push(action.payload);
    },
    deleteCustomExercise: (state, action: PayloadAction<string>) => {
      state.exercises = state.exercises.filter((e) => e.id !== action.payload);
    },
  },
});

export const { addLog, editLog, deleteLog, addCustomExercise, deleteCustomExercise } =
  exercisesSlice.actions;

export default exercisesSlice.reducer;
