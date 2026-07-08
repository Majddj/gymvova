import { useAppDispatch, useAppSelector } from '../../../store';
import { addLog, editLog, deleteLog, addCustomExercise } from '../store/exercisesSlice';
import { WorkoutLog, Exercise } from '../types';
import { getTodayString } from '../../../shared/utils/dateUtils';
import { v4 as uuidv4 } from 'uuid';

export const useExercises = () => {
  const dispatch = useAppDispatch();
  const { exercises, logs } = useAppSelector((state) => state.exercises);

  const todayLogs = logs.filter((log) => log.date === getTodayString());

  const getLogsForDate = (date: string) =>
    logs.filter((log) => log.date === date);

  const getLogsForExercise = (exerciseId: string) =>
    logs.filter((log) => log.exerciseId === exerciseId);

  const handleAddLog = (
    exercise: Exercise,
    reps: number,
    sets: number,
    note: string = '',
    date: string = getTodayString()
  ) => {
    const now = new Date().toISOString();
    const newLog: WorkoutLog = {
      id: uuidv4(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      date,
      reps,
      sets,
      note,
      createdAt: now,
      updatedAt: now,
    };
    dispatch(addLog(newLog));
  };

  const handleEditLog = (
    log: WorkoutLog,
    reps: number,
    sets: number,
    note: string,
    date: string = log.date
  ) => {
    dispatch(
      editLog({
        ...log,
        date,
        reps,
        sets,
        note,
        updatedAt: new Date().toISOString(),
      })
    );
  };

  const handleDeleteLog = (logId: string) => {
    dispatch(deleteLog(logId));
  };

  const handleAddCustomExercise = (name: string, unit: 'reps' | 'seconds') => {
    const id = uuidv4();
    const exercise: Exercise = {
      id,
      type: 'custom',
      name,
      icon: 'star',
      unit,
      isCustom: true,
    };
    dispatch(addCustomExercise(exercise));
  };

  return {
    exercises,
    logs,
    todayLogs,
    getLogsForDate,
    getLogsForExercise,
    handleAddLog,
    handleEditLog,
    handleDeleteLog,
    handleAddCustomExercise,
  };
};
