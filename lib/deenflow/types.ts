export type AccentName = "forest" | "ocean" | "indigo" | "plum";
export type DisplayMode = "light" | "dark" | "amoled";

export type ChecklistTask = {
  id: string;
  title: string;
  points: number;
  weekly?: boolean;
};

export type ChecklistCategory = {
  id: string;
  title: string;
  tasks: ChecklistTask[];
};

export type Adhkar = {
  id: string;
  dhikr: string;
  meaning: string;
  blessings: string;
  target: number;
  rewardValue: number;
  rewardUnit: string;
  createdAt: string;
};

export type DayEntry = {
  tasks: Record<string, number>;
  adhkar: Record<string, number>;
};

export type Preferences = {
  display: DisplayMode;
  accent: AccentName;
};

export type DeenFlowData = {
  version: 1;
  categories: ChecklistCategory[];
  adhkar: Adhkar[];
  entries: Record<string, DayEntry>;
  preferences: Preferences;
};

export type RewardTotal = {
  unit: string;
  value: number;
};
