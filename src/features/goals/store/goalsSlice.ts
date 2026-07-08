import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
    addGoal: (state, action: PayloadAction<Goal>) => {
      state.goals.push(action.payload);
    },
    editGoal: (state, action: PayloadAction<Goal>) => {
      const index = state.goals.findIndex((g) => g.id === action.payload.id);
      if (index !== -1) {
        state.goals[index] = action.payload;
      }
    },
    deleteGoal: (state, action: PayloadAction<string>) => {
      state.goals = state.goals.filter((g) => g.id !== action.payload);
    },
    toggleGoalActive: (state, action: PayloadAction<string>) => {
      const goal = state.goals.find((g) => g.id === action.payload);
      if (goal) {
        goal.isActive = !goal.isActive;
      }
    },
  },
});

export const { addGoal, editGoal, deleteGoal, toggleGoalActive } = goalsSlice.actions;
export default goalsSlice.reducer;
