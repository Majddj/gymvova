import { combineReducers } from '@reduxjs/toolkit';
import exercisesReducer from '../features/exercises/store/exercisesSlice';
import goalsReducer from '../features/goals/store/goalsSlice';

const rootReducer = combineReducers({
  exercises: exercisesReducer,
  goals: goalsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
