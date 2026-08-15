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

  const json = JSON.stringify(
    backup,
    null,
    2
  );

  const date = new Date()
    .toISOString()
    .slice(0, 10);

  const fileName =
    `vova-gym-backup-${date}.json`;

  const browser = globalThis as any;

  const BlobRef = browser.Blob;
  const URLRef = browser.URL;
  const documentRef = browser.document;

  if (
    !BlobRef ||
    !URLRef ||
    !documentRef
  ) {
    throw new Error(
      'Экспорт доступен только в браузере'
    );
  }

  const blob = new BlobRef(
    [json],
    {
      type: 'application/json',
    }
  );

  const url =
    URLRef.createObjectURL(blob);

  const link =
    documentRef.createElement('a');

  link.href = url;
  link.download = fileName;

  documentRef.body.appendChild(link);

  console.log('EXPORT JSON SIZE:', json.length);
  console.log('EXPORT FILE NAME:', fileName);
  console.log('EXPORT URL:', url);

  link.click();

  link.remove();

  browser.setTimeout(() => {
    URLRef.revokeObjectURL(url);
  }, 1000);
};