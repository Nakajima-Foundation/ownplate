import { isNull } from "@/utils/commonUtils";
import type { MenuData } from "@/models/menu";

export type OrderExceptData = {
  exceptDay: { [key: string]: boolean };
  exceptHours: { start: number; end: number }[];
};

// 注文の中のどれか 1 品でも受け取れない曜日・時間帯は、注文全体で受け取れない。
export const exceptDataOf = (
  menuItems: { [key: string]: MenuData } | undefined,
): OrderExceptData =>
  Object.values(menuItems || {}).reduce<OrderExceptData>(
    (tmp, menu) => {
      const { exceptDay, exceptHour } = menu;
      const menuExceptDay = exceptDay || {};
      Object.keys(menuExceptDay).forEach((key) => {
        if (menuExceptDay[key]) {
          tmp.exceptDay[key] = true;
        }
      });
      if (
        !isNull(exceptHour) &&
        !isNull(exceptHour.start) &&
        !isNull(exceptHour.end)
      ) {
        tmp.exceptHours.push({
          start: exceptHour.start,
          end: exceptHour.end,
        });
      }
      return tmp;
    },
    { exceptDay: {}, exceptHours: [] },
  );
