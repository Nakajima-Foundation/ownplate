import type { Timestamp } from "../models/firebaseUtils";

const MS_PER_HOUR = 60 * 60 * 1000;
const CONTINUOUS_ORDER_HOURS = 4;

// 同じお客様の前の注文（userLog の lastUpdatedAt）から前後 4 時間以内に作られた注文。
// ちょうど同じ時刻のときは知らせない。
export const isContinuousOrder = (
  timeCreated: Timestamp | undefined,
  lastUpdatedAt: Timestamp | undefined,
): boolean => {
  if (!timeCreated || !lastUpdatedAt || timeCreated.isEqual(lastUpdatedAt)) {
    return false;
  }
  const hours =
    (timeCreated.toMillis() - lastUpdatedAt.toMillis()) / MS_PER_HOUR;
  return Math.abs(hours) < CONTINUOUS_ORDER_HOURS;
};
