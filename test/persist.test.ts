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
    const data = {
      habits: [{ id: 'a', name: 'test', createdAt: '2024', goalSeconds: 86400, streak: 0 }],
      logs: [{ habitId: 'a', at: '2024', deltaSeconds: 5 }]
    };
    await save(data, 'x');
    const loaded = await load<typeof data>('x');
    expect(loaded).toEqual(data);
  });
});
