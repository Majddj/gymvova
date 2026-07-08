import { useAppDispatch, useAppSelector } from '../../../store';
import { addGoal, editGoal, deleteGoal } from '../store/goalsSlice';
import { Goal, GoalPeriod } from '../types';
import { getPeriodRange, isDateInRange } from '../../../shared/utils/dateUtils';
import { v4 as uuidv4 } from 'uuid';

export const useGoals = () => {
  const dispatch = useAppDispatch();
  const goals = useAppSelector((state: any) => state.goals.goals);
  const logs = useAppSelector((state: any) => state.exercises.logs);

  const getProgressForGoal = (goal: Goal) => {
    const range = getPeriodRange(goal.period);
    const relevantLogs = logs.filter(
      (log: any) =>
        log.exerciseId === goal.exerciseId &&
        isDateInRange(log.date, range.start, range.end)
    );
    const total = relevantLogs.reduce(
      (sum: number, log: any) => sum + log.reps * log.sets,
      0
    );
    const percentage = Math.min((total / goal.targetReps) * 100, 100);
    return { total, percentage };
  };

  const handleAddGoal = (
    exerciseId: string,
    exerciseName: string,
    exerciseIcon: string,
    targetReps: number,
    period: GoalPeriod
  ) => {
    const range = getPeriodRange(period);
    const newGoal: Goal = {
      id: uuidv4(),
      exerciseId,
      exerciseName,
      exerciseIcon,
      targetReps,
      period,
      startDate: range.start,
      endDate: range.end,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    dispatch(addGoal(newGoal));
  };

  const handleEditGoal = (goal: Goal, targetReps: number, period: GoalPeriod) => {
    const range = getPeriodRange(period);
    dispatch(
      editGoal({
        ...goal,
        targetReps,
        period,
        startDate: range.start,
        endDate: range.end,
      })
    );
  };

  const handleDeleteGoal = (goalId: string) => {
    dispatch(deleteGoal(goalId));
  };

  return {
    goals,
    getProgressForGoal,
    handleAddGoal,
    handleEditGoal,
    handleDeleteGoal,
  };
};
