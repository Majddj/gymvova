import {
  store,
  persistor,
} from '../../store';

import {
  mergeExercisesBackup,
} from '../exercises/store/exercisesSlice';

import {
  mergeGoalsBackup,
} from '../goals/store/goalsSlice';

import type {
  Exercise,
  WorkoutLog,
} from '../exercises/types';

import type {
  Goal,
} from '../goals/types';


interface VovaGymBackup {
  app: 'vova-gym';
  version: 1;
  createdAt: string;

  data: {
    exercises: {
      exercises: Exercise[];
      logs: WorkoutLog[];
    };

    goals: {
      goals: Goal[];
    };
  };
}


export interface ImportBackupResult {
  exercisesAdded: number;
  logsAdded: number;
  goalsAdded: number;
}


const isValidBackup = (
  value: any
): value is VovaGymBackup => {
  return (
    value?.app === 'vova-gym' &&
    value?.version === 1 &&

    Array.isArray(
      value?.data?.exercises?.exercises
    ) &&

    Array.isArray(
      value?.data?.exercises?.logs
    ) &&

    Array.isArray(
      value?.data?.goals?.goals
    )
  );
};


export const importBackup = async (
  backupText: string
): Promise<ImportBackupResult> => {

  const text = backupText.trim();

  if (!text) {
    throw new Error(
      'Вставь резервную копию'
    );
  }


  let backup: unknown;


  try {
    backup = JSON.parse(text);
  } catch {
    throw new Error(
      'Резервная копия повреждена'
    );
  }


  if (!isValidBackup(backup)) {
    throw new Error(
      'Это не резервная копия VOVA GYM'
    );
  }


  const currentState =
    store.getState();


  const missingExercises =
    backup.data.exercises.exercises.filter(
      (exercise) => {
        return !currentState
          .exercises
          .exercises
          .some(
            (currentExercise) =>
              currentExercise.id ===
              exercise.id
          );
      }
    );


  const missingLogs =
    backup.data.exercises.logs.filter(
      (log) => {
        return !currentState
          .exercises
          .logs
          .some(
            (currentLog) =>
              currentLog.id === log.id
          );
      }
    );


  const missingGoals =
    backup.data.goals.goals.filter(
      (goal) => {
        return !currentState
          .goals
          .goals
          .some(
            (currentGoal) =>
              currentGoal.id ===
              goal.id
          );
      }
    );


  store.dispatch(
    mergeExercisesBackup({
      exercises: missingExercises,
      logs: missingLogs,
    })
  );


  store.dispatch(
    mergeGoalsBackup({
      goals: missingGoals,
    })
  );


  await persistor.flush();


  return {
    exercisesAdded:
      missingExercises.length,

    logsAdded:
      missingLogs.length,

    goalsAdded:
      missingGoals.length,
  };
};