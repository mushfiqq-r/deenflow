import { fromDateKey, shiftDate, toDateKey } from "./date";
import type { Adhkar, ChecklistCategory, DeenFlowData, RewardTotal } from "./types";

const day = (data: DeenFlowData, date: string) => data.entries[date] ?? { tasks: {}, adhkar: {} };

export const allTasks = (categories: ChecklistCategory[]) => categories.flatMap((category) => category.tasks);

export const taskPointsForDate = (data: DeenFlowData, date: string) => {
  const entries = day(data, date).tasks;
  return allTasks(data.categories).reduce((total, task) => total + (entries[task.id] ?? 0) * task.points, 0);
};

export const taskMaximum = (categories: ChecklistCategory[], includeWeekly = true) =>
  allTasks(categories)
    .filter((task) => includeWeekly || !task.weekly)
    .reduce((total, task) => total + task.points, 0);

export const completionForDate = (data: DeenFlowData, date: string) => {
  const tasks = allTasks(data.categories);
  const counts = day(data, date).tasks;
  const completed = tasks.filter((task) => (counts[task.id] ?? 0) > 0).length;
  return { completed, total: tasks.length, percent: tasks.length ? Math.round((completed / tasks.length) * 100) : 0 };
};

export const rewardForAdhkar = (adhkar: Adhkar, count: number) => adhkar.rewardValue * count;

export const rewardTotals = (data: DeenFlowData, date?: string): RewardTotal[] => {
  const totals = new Map<string, number>();
  const dates = date ? [date] : Object.keys(data.entries);
  dates.forEach((dayKey) => {
    const entries = day(data, dayKey).adhkar;
    data.adhkar.forEach((item) => {
      const count = entries[item.id] ?? 0;
      if (count > 0) totals.set(item.rewardUnit, (totals.get(item.rewardUnit) ?? 0) + rewardForAdhkar(item, count));
    });
  });
  return Array.from(totals.entries())
    .map(([unit, value]) => ({ unit, value }))
    .sort((a, b) => b.value - a.value);
};

export const periodSummary = (data: DeenFlowData, days: number, endDate = toDateKey()) => {
  const dates = Array.from({ length: days }, (_, index) => shiftDate(endDate, index - (days - 1)));
  const daily = dates.map((date) => ({
    date,
    points: taskPointsForDate(data, date),
    completion: completionForDate(data, date).percent,
    rewards: rewardTotals(data, date).reduce((sum, reward) => sum + reward.value, 0),
  }));
  const activeDays = daily.filter((item) => item.points > 0 || item.rewards > 0).length;
  return {
    daily,
    activeDays,
    points: daily.reduce((sum, item) => sum + item.points, 0),
    rewards: daily.reduce((sum, item) => sum + item.rewards, 0),
    completion: daily.length ? Math.round(daily.reduce((sum, item) => sum + item.completion, 0) / daily.length) : 0,
  };
};

export const performanceInsight = (data: DeenFlowData) => {
  const recent = periodSummary(data, 7);
  const priorEnd = shiftDate(toDateKey(), -7);
  const previous = periodSummary(data, 7, priorEnd);
  const delta = recent.completion - previous.completion;
  if (recent.activeDays === 0) return "Begin with one small task or dhikr today. A simple first entry starts a visible pattern.";
  if (recent.activeDays >= 6 && delta >= 0) return "Strong consistency: you were active on most days this week. Keep your smallest routine protected on busy days.";
  if (delta >= 12) return `Momentum is building: average completion is up ${delta} points from the previous week.`;
  if (delta <= -12) return `Completion is down ${Math.abs(delta)} points from the previous week. Revisit your most meaningful two tasks and rebuild from there.`;
  if (recent.activeDays <= 3) return "Your entries cluster on a few days. Try attaching one checklist task or dhikr to an existing daily anchor.";
  return "Your rhythm is steady. A focused intention for one category can make the next week more purposeful.";
};

export const startOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), 1);
export const startOfYear = (date = new Date()) => new Date(date.getFullYear(), 0, 1);
export const dateDifference = (from: Date, to = new Date()) => Math.max(1, Math.floor((to.getTime() - from.getTime()) / 86400000) + 1);

export const periodRangeLabel = (days: number) => {
  if (days === 7) return "Last 7 days";
  if (days >= 365) return "This year";
  const first = fromDateKey(shiftDate(toDateKey(), -(days - 1)));
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(first) + " – today";
};
