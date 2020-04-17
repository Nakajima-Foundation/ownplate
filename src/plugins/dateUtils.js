export const midNight = (delta = 0) => {
  const date = new Date();
  date.setHours(0); // local midnight
  date.setMinutes(0);
  date.setDate(date.getDate() + delta);
  return date;
};
