export const createId = () => {
  const cryptoApi = globalThis as typeof globalThis & {
    crypto?: {
      randomUUID?: () => string;
      getRandomValues?: (array: Uint8Array) => Uint8Array;
    };
  };

  if (typeof cryptoApi.crypto?.randomUUID === 'function') {
    return cryptoApi.crypto.randomUUID();
  }

  if (typeof cryptoApi.crypto?.getRandomValues === 'function') {
    const array = new Uint8Array(16);
    cryptoApi.crypto.getRandomValues(array);

    array[6] = (array[6] & 0x0f) | 0x40;
    array[8] = (array[8] & 0x3f) | 0x80;

    const hex = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }

  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};
