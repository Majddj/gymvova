import { store } from '../../store';

type StoreState = ReturnType<typeof store.getState>;

interface VovaGymBackup {
  app: 'vova-gym';
  version: 1;
  createdAt: string;

  data: {
    exercises: StoreState['exercises'];
    goals: StoreState['goals'];
  };
}

export const exportBackup = (): void => {
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

  const json = JSON.stringify(backup, null, 2);

  const browser = globalThis as any;

  const BrowserBlob = browser.Blob;
  const documentRef = browser.document;
  const URLRef = browser.URL;

  if (!BrowserBlob || !documentRef || !URLRef) {
    throw new Error(
      'Экспорт backup доступен только в браузере'
    );
  }

  const blob = new BrowserBlob([json], {
    type: 'application/json',
  });

  const url = URLRef.createObjectURL(blob);

  const link = documentRef.createElement('a');

  const date = new Date()
    .toISOString()
    .slice(0, 10);

  link.href = url;
  link.download = `vova-gym-backup-${date}.json`;

  documentRef.body.appendChild(link);

  link.click();
  link.remove();

  browser.setTimeout(() => {
    URLRef.revokeObjectURL(url);
  }, 1000);
};