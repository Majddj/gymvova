import {
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

import { Goal } from '../types';

interface GoalsState {
  goals: Goal[];
}

const initialState: GoalsState = {
  goals: [],
};

const goalsSlice = createSlice({
  name: 'goals',
  initialState,

  reducers: {
    addGoal: (
      state,
      action: PayloadAction<Goal>
    ) => {
      state.goals.push(action.payload);
    },

    editGoal: (
      state,
      action: PayloadAction<Goal>
    ) => {
      const index = state.goals.findIndex(
        (goal) =>
          goal.id === action.payload.id
      );

      if (index !== -1) {
        state.goals[index] = action.payload;
      }
    },

    deleteGoal: (
      state,
      action: PayloadAction<string>
    ) => {
      state.goals = state.goals.filter(
        (goal) =>
          goal.id !== action.payload
      );
    },

    toggleGoalActive: (
      state,
      action: PayloadAction<string>
    ) => {
      const goal = state.goals.find(
        (goal) =>
          goal.id === action.payload
      );

      if (goal) {
        goal.isActive = !goal.isActive;
      }
    },

    // Импорт целей из backup.
    // Существующие цели НЕ удаляются.
    mergeGoalsBackup: (
      state,
      action: PayloadAction<{
        goals: Goal[];
      }>
    ) => {
      for (const goal of action.payload.goals) {
        const exists = state.goals.some(
          (currentGoal) =>
            currentGoal.id === goal.id
        );

        if (!exists) {
          state.goals.push(goal);
        }
      }
    },
  },
});

export const {
  addGoal,
  editGoal,
  deleteGoal,
  toggleGoalActive,
  mergeGoalsBackup,
} = goalsSlice.actions;

export default goalsSlice.reducer;