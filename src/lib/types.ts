export type Habit = {
  id: string;
  name: string;
  createdAt: string;
  goalSeconds: number; // target interval (default 86400)
  streak: number;      // consecutive goal hits
  lastLoggedAt?: string; // cache of last log timestamp (optional)
};

export type Log = {
  id: string;
  habitId: string;
  at: string;
  deltaSeconds?: number;
  note?: string;
};

export type SaveData = {
  habits: Habit[];
  logs: Log[];
};
