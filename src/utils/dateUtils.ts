export const formatDateYMD = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const midNight = (delta = 0) => {
  const date = new Date();
  date.setHours(0); // local midnight
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  date.setDate(date.getDate() + delta);
  return date;
};

export const midNightOfMonth = (delta = 0) => {
  const date = new Date();
  date.setHours(0); // local midnight
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  date.setDate(1);
  date.setMonth(date.getMonth() + delta);
  return date;
};
