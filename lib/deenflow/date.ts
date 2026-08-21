export const toDateKey = (date = new Date()) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export const fromDateKey = (key: string) => new Date(`${key}T12:00:00`);

export const getWeekDays = (reference: string) => {
  const selected = fromDateKey(reference);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(selected);
    date.setDate(selected.getDate() + index - 3);
    const key = toDateKey(date);
    return {
      key,
      day: new Intl.DateTimeFormat(undefined, { weekday: "narrow" }).format(date),
      date: date.getDate(),
      isToday: key === toDateKey(),
    };
  });
};

export const readableDate = (key: string) =>
  new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(fromDateKey(key));

export const shiftDate = (key: string, days: number) => {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
};
