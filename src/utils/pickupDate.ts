// 受取日（その日の 0 時）に 0 時からの分数を足した日時。受取日の一覧の Date は画面が表示に使い回すので、書き換えずに複製する。
export const pickupDateOf = (day: Date, minutesFromMidnight: number): Date => {
  const pickupDate = new Date(day);
  pickupDate.setHours(minutesFromMidnight / 60);
  pickupDate.setMinutes(minutesFromMidnight % 60);
  return pickupDate;
};
