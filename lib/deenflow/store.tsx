import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createInitialData } from "./seed";
import type { AccentName, Adhkar, ChecklistTask, DeenFlowData, DisplayMode, Preferences } from "./types";

const STORAGE_KEY = "deenflow.local-data.v1";
const emptyDay = () => ({ tasks: {}, adhkar: {} });
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

type NewAdhkar = Omit<Adhkar, "id" | "createdAt">;
type Store = {
  data: DeenFlowData;
  isReady: boolean;
  setTaskCount: (taskId: string, date: string, value: number) => void;
  addTask: (categoryId: string, task: Omit<ChecklistTask, "id">) => void;
  updateTask: (taskId: string, task: Pick<ChecklistTask, "title" | "points">) => void;
  addCategory: (title: string) => void;
  addAdhkar: (entry: NewAdhkar) => void;
  updateAdhkar: (id: string, entry: NewAdhkar) => void;
  setAdhkarCount: (id: string, date: string, value: number) => void;
  setPreferences: (preferences: Partial<Preferences>) => void;
  exportData: () => string;
  importData: (raw: string) => { valid: boolean; message: string; preview?: DeenFlowData };
  applyImportedData: (next: DeenFlowData) => void;
  clearData: () => void;
};

const DeenFlowContext = createContext<Store | null>(null);

function normalize(candidate: unknown): DeenFlowData | null {
  if (!candidate || typeof candidate !== "object") return null;
  const data = candidate as Partial<DeenFlowData>;
  if (!Array.isArray(data.categories) || !Array.isArray(data.adhkar) || !data.entries) return null;
  return {
    version: 1,
    categories: data.categories,
    adhkar: data.adhkar,
    entries: data.entries,
    preferences: {
      display: data.preferences?.display === "dark" || data.preferences?.display === "amoled" ? data.preferences.display : "light",
      accent: ["ocean", "indigo", "plum"].includes(data.preferences?.accent ?? "") ? data.preferences?.accent as AccentName : "forest",
    },
  };
}

export function DeenFlowProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DeenFlowData>(createInitialData);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => AsyncStorage.getItem(STORAGE_KEY))
      .then((saved) => {
        if (!active || !saved) return;
        const parsed = normalize(JSON.parse(saved));
        if (parsed) setData(parsed);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setIsReady(true);
      });
    return () => { active = false; };
  }, []);

  const commit = useCallback((updater: (previous: DeenFlowData) => DeenFlowData) => {
    setData((previous) => {
      const next = updater(previous);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  const setTaskCount = useCallback((taskId: string, date: string, value: number) => {
    commit((previous) => {
      const entry = previous.entries[date] ?? emptyDay();
      return {
        ...previous,
        entries: { ...previous.entries, [date]: { ...entry, tasks: { ...entry.tasks, [taskId]: Math.max(0, value) } } },
      };
    });
  }, [commit]);

  const addTask = useCallback((categoryId: string, task: Omit<ChecklistTask, "id">) => {
    commit((previous) => ({
      ...previous,
      categories: previous.categories.map((category) => category.id === categoryId
        ? { ...category, tasks: [...category.tasks, { ...task, id: makeId("task") }] }
        : category),
    }));
  }, [commit]);

  const updateTask = useCallback((taskId: string, task: Pick<ChecklistTask, "title" | "points">) => {
    commit((previous) => ({
      ...previous,
      categories: previous.categories.map((category) => ({
        ...category,
        tasks: category.tasks.map((item) => item.id === taskId ? { ...item, ...task } : item),
      })),
    }));
  }, [commit]);

  const addCategory = useCallback((title: string) => {
    commit((previous) => ({ ...previous, categories: [...previous.categories, { id: makeId("category"), title, tasks: [] }] }));
  }, [commit]);

  const addAdhkar = useCallback((entry: NewAdhkar) => {
    commit((previous) => ({ ...previous, adhkar: [...previous.adhkar, { ...entry, id: makeId("dhikr"), createdAt: new Date().toISOString() }] }));
  }, [commit]);

  const updateAdhkar = useCallback((id: string, entry: NewAdhkar) => {
    commit((previous) => ({ ...previous, adhkar: previous.adhkar.map((item) => item.id === id ? { ...item, ...entry } : item) }));
  }, [commit]);

  const setAdhkarCount = useCallback((id: string, date: string, value: number) => {
    commit((previous) => {
      const entry = previous.entries[date] ?? emptyDay();
      return { ...previous, entries: { ...previous.entries, [date]: { ...entry, adhkar: { ...entry.adhkar, [id]: Math.max(0, value) } } } };
    });
  }, [commit]);

  const setPreferences = useCallback((preferences: Partial<Preferences>) => {
    commit((previous) => ({ ...previous, preferences: { ...previous.preferences, ...preferences } }));
  }, [commit]);

  const importData = useCallback((raw: string) => {
    try {
      const parsed = normalize(JSON.parse(raw));
      if (!parsed) return { valid: false, message: "This file is not a recognizable DeenFlow backup." };
      return { valid: true, message: "Backup ready for review.", preview: parsed };
    } catch {
      return { valid: false, message: "The selected file could not be read as a DeenFlow backup." };
    }
  }, []);

  const applyImportedData = useCallback((next: DeenFlowData) => commit(() => next), [commit]);
  const clearData = useCallback(() => commit(() => createInitialData()), [commit]);

  const value = useMemo<Store>(() => ({
    data, isReady, setTaskCount, addTask, updateTask, addCategory, addAdhkar, updateAdhkar, setAdhkarCount,
    setPreferences, exportData: () => JSON.stringify(data, null, 2), importData, applyImportedData, clearData,
  }), [data, isReady, setTaskCount, addTask, updateTask, addCategory, addAdhkar, updateAdhkar, setAdhkarCount, setPreferences, importData, applyImportedData, clearData]);

  return <DeenFlowContext.Provider value={value}>{children}</DeenFlowContext.Provider>;
}

export function useDeenFlow() {
  const value = useContext(DeenFlowContext);
  if (!value) throw new Error("useDeenFlow must be used within DeenFlowProvider");
  return value;
}
