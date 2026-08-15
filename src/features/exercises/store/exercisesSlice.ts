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
    addLog: (
      state,
      action: PayloadAction<WorkoutLog>
    ) => {
      state.logs.push(action.payload);
    },

    editLog: (
      state,
      action: PayloadAction<WorkoutLog>
    ) => {
      const index = state.logs.findIndex(
        (log) => log.id === action.payload.id
      );

      if (index !== -1) {
        state.logs[index] = action.payload;
      }
    },

    deleteLog: (
      state,
      action: PayloadAction<string>
    ) => {
      state.logs = state.logs.filter(
        (log) => log.id !== action.payload
      );
    },

    addCustomExercise: (
      state,
      action: PayloadAction<Exercise>
    ) => {
      state.exercises.push(action.payload);
    },

    deleteCustomExercise: (
      state,
      action: PayloadAction<string>
    ) => {
      state.exercises =
        state.exercises.filter(
          (exercise) =>
            exercise.id !== action.payload
        );
    },

    // Добавляем данные из backup,
    // но ничего существующего не удаляем.
    mergeExercisesBackup: (
      state,
      action: PayloadAction<{
        exercises: Exercise[];
        logs: WorkoutLog[];
      }>
    ) => {
      for (
        const exercise
        of action.payload.exercises
      ) {
        const exists =
          state.exercises.some(
            (currentExercise) =>
              currentExercise.id ===
              exercise.id
          );

        if (!exists) {
          state.exercises.push(exercise);
        }
      }

      for (
        const log
        of action.payload.logs
      ) {
        const exists =
          state.logs.some(
            (currentLog) =>
              currentLog.id === log.id
          );

        if (!exists) {
          state.logs.push(log);
        }
      }
    },
  },
});

export const {
  addLog,
  editLog,
  deleteLog,
  addCustomExercise,
  deleteCustomExercise,
  mergeExercisesBackup,
} = exercisesSlice.actions;

export default exercisesSlice.reducer;