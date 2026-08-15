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

import * as DocumentPicker from 'expo-document-picker';


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
): Promise<ImportBackupResult | null> => {

  const result =
    await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      multiple: false,
    });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];

  let text: string;

  // Web / Telegram WebView
  if (
    asset.file &&
    typeof asset.file.text === 'function'
  ) {
    text = await asset.file.text();
  } else {
    // Если File недоступен — читаем через URI
    const response =
      await fetch(asset.uri);

    text = await response.text();
  }

  if (!text.trim()) {
    throw new Error(
      'Выбранный backup пуст'
    );
  }

  let backup: unknown;

  try {
    backup = JSON.parse(text);
  } catch {
    throw new Error(
      'Файл повреждён или не является JSON'
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
      (exercise) =>
        !currentState.exercises.exercises.some(
          (currentExercise) =>
            currentExercise.id === exercise.id
        )
    );

  const missingLogs =
    backup.data.exercises.logs.filter(
      (log) =>
        !currentState.exercises.logs.some(
          (currentLog) =>
            currentLog.id === log.id
        )
    );

  const missingGoals =
    backup.data.goals.goals.filter(
      (goal) =>
        !currentState.goals.goals.some(
          (currentGoal) =>
            currentGoal.id === goal.id
        )
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