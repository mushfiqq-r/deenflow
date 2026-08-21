import type { ChecklistCategory, DeenFlowData } from "./types";

const id = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const category = (title: string, rows: Array<[string, number]>, weekly = false): ChecklistCategory => ({
  id: id(title),
  title,
  tasks: rows.map(([task, points]) => ({ id: id(`${title}-${task}`), title: task, points, weekly })),
});

export const initialCategories: ChecklistCategory[] = [
  category("Prayers", [
    ["Obligatory prayers with the congregation", 5],
    ["Mandatory Sunnah prayers", 12],
    ["Morning voluntary prayers", 1],
    ["Nightly prayers", 1],
    ["Praying with focus & humility", 1],
  ]),
  category("Qur’an", [
    ["Daily surahs (36, 55, 67)", 3],
    ["Daily recitation (minimum 2 pages)", 2],
    ["Daily memorization session", 1],
  ]),
  category("Adhkaar", [
    ["Dhikr after obligatory prayers", 1],
    ["Morning & evening adhkaar", 2],
    ["Following the everyday Sunnah", 1],
  ]),
  category("Good Character", [
    ["Devotion & consistency", 2],
    ["No backbiting, slandering, gossiping", 3],
    ["Speak truth, keep words & control anger", 3],
    ["Safeguarding chastity, tongue & sight", 3],
    ["No music or Haram entertainment", 1],
    ["Spread salaam & goodness", 2],
    ["Sadaqah & helping others", 2],
    ["Fulfilling responsibilities correctly", 1],
    ["Talk less, eat less, sleep justly", 3],
  ]),
  category("Knowledge Seeking", [
    ["Studying the translation of Al Qur’an", 1],
    ["Memorize one dua daily", 1],
    ["Career development", 1],
    ["Academic study", 1],
  ]),
  category("Dua", [
    ["Dua for parents, relatives & friends", 3],
    ["Dua for the oppressed Muslims", 1],
    ["Personal conversation with Allah ﷻ", 1],
  ]),
  category("Physical Health", [
    ["Hit the gym (40 minutes)", 1],
    ["Follow a balanced diet plan", 1],
    ["Abstain from sugar, processed foods", 2],
    ["Follow morning & afternoon rituals", 2],
    ["Drink 4 liters of water daily", 1],
    ["Brush teeth twice a day", 2],
  ]),
  category("Weekly Checklist", [
    ["Monday & Thursday optional fasting", 2],
    ["Surah Kahf on Fridays", 1],
    ["Send more blessings on Rasulullah ﷺ on Fridays", 1],
    ["Be one of the firsts at the mosque on Jumu’ah", 1],
    ["Sadaqah & taking care for a sick person", 2],
    ["Cleanliness and ensuring physical hygiene", 2],
  ], true),
];

export const createInitialData = (): DeenFlowData => ({
  version: 1,
  categories: initialCategories,
  adhkar: [],
  entries: {},
  preferences: { display: "light", accent: "forest" },
});
