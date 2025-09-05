export type Habit = {
  id: string;
  name: string;
  createdAt: string;
  goalSeconds: number; // target interval (default 86400)
  streak: number;      // consecutive goal hits
  lastLoggedAt?: string; // cache of last log timestamp (optional)
};

export type Log = {
  habitId: string;
  at: string;
  deltaSeconds?: number;
};

export type SaveData = {
  habits: Habit[];
  logs: Log[];
};
