import { describe, it, expect, vi } from 'vitest';
import { load, save } from '../src/lib/persist';

vi.mock('localforage', () => {
  const store = new Map<string, any>();
  return {
    default: {
      async getItem(key: string) { return store.get(key) ?? null; },
      async setItem(key: string, value: any) { store.set(key, value); }
    }
  };
});

describe('persist', () => {
  it('round-trips JSON data', async () => {
    const data = { habits: [{ id: 'a', name: 'test', logs: [{ ts: 1 }] }] };
    await save(data, 'x');
    const loaded = await load<typeof data>('x');
    expect(loaded).toEqual(data);
  });
});
