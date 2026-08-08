import { store } from '../../store';

type StoreState =
  ReturnType<typeof store.getState>;

interface VovaGymBackup {
  app: 'vova-gym';
  version: 1;
  createdAt: string;

  data: {
    exercises: StoreState['exercises'];
    goals: StoreState['goals'];
  };
}

export const exportBackup = (): string => {
  const state = store.getState();

  const backup: VovaGymBackup = {
    app: 'vova-gym',
    version: 1,
    createdAt: new Date().toISOString(),

    data: {
      exercises: state.exercises,
      goals: state.goals,
    },
  };

  return JSON.stringify(backup);
};