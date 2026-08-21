import { describe, expect, it } from "vitest";
import { completionForDate, performanceInsight, periodSummary, rewardForAdhkar, rewardTotals } from "../lib/deenflow/analytics";
import { toDateKey } from "../lib/deenflow/date";
import { createInitialData } from "../lib/deenflow/seed";
import type { Adhkar, DeenFlowData } from "../lib/deenflow/types";

describe("DeenFlow analytics", () => {
  it("calculates one completion per configured daily task, even when a task count is greater than one", () => {
    const data = createInitialData();
    const dailyTask = data.categories.flatMap((category) => category.tasks).find((task) => !task.weekly);
    expect(dailyTask).toBeDefined();
    const date = "2026-08-21";
    const tracked: DeenFlowData = { ...data, entries: { [date]: { tasks: { [dailyTask!.id]: 3 }, adhkar: {} } } };
    const completion = completionForDate(tracked, date);
    expect(completion.completed).toBe(1);
    expect(completion.total).toBeGreaterThan(1);
  });

  it("multiplies repetitions by the user-defined reward value and groups totals by reward unit", () => {
    const adhkar: Adhkar = { id: "dhikr-test", dhikr: "SubhanAllah", meaning: "Glory be to Allah", blessings: "Remembrance", target: 100, rewardValue: 3, rewardUnit: "Trees", createdAt: "2026-08-21T00:00:00.000Z" };
    const data: DeenFlowData = { version: 1, categories: [], adhkar: [adhkar], entries: { "2026-08-21": { tasks: {}, adhkar: { "dhikr-test": 7 } } }, preferences: { display: "light", accent: "forest" } };
    expect(rewardForAdhkar(adhkar, 7)).toBe(21);
    expect(rewardTotals(data)).toEqual([{ unit: "Trees", value: 21 }]);
  });

  it("aggregates recorded history into a period summary and produces a private trend insight", () => {
    const initial = createInitialData();
    const date = toDateKey();
    const task = initial.categories[0].tasks[0];
    const data: DeenFlowData = { ...initial, entries: { [date]: { tasks: { [task.id]: 1 }, adhkar: {} } } };
    const summary = periodSummary(data, 7);
    expect(summary.activeDays).toBe(1);
    expect(summary.points).toBe(task.points);
    expect(performanceInsight(data)).toContain("checklist");
  });
});
