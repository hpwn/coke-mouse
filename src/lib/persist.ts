import localforage from 'localforage';

export async function load<T>(key = 'cm:v1'): Promise<T | null> {
  try {
    return (await localforage.getItem<T>(key)) ?? null;
  } catch {
    return null;
  }
}

export async function save<T>(data: T, key = 'cm:v1'): Promise<void> {
  try {
    await localforage.setItem(key, data);
  } catch {
    /* ignore */
  }
}
