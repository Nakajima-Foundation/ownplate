export const midNight = () => {
  const date = new Date();
  date.setHours(0); // local midnight
  date.setMinutes(0);
  return date;
};
