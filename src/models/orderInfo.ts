import { orderType } from "@/utils/utils";
import { stripe_regions_jp } from "../config/constant";
import { OrderInfoData } from "./orderInfoData";
export type { OrderInfoData } from "./orderInfoData";

type Accounting = NonNullable<OrderInfoData["accounting"]>;

export type ReportRow = OrderInfoData & {
  accounting: Accounting & { service: NonNullable<Accounting["service"]> };
};

// 検めるのは有無だけ。`ReportRow` が `OrderInfoData` に足している約束もそれだけ。
const hasAccounting = (order: OrderInfoData): order is ReportRow =>
  order.accounting !== undefined && order.accounting.service !== undefined;

export const order2ReportData = (
  order: OrderInfoData,
  serviceTaxRate: number,
): ReportRow => {
  const multiple = stripe_regions_jp.multiple;
  // @ts-expect-error maybe different type or undefine
  order.timeConfirmed = order?.timeConfirmed?.toDate();
  // @ts-expect-error maybe different type or undefine
  order.timePlaced = order?.timePlaced?.toDate();
  // @ts-expect-error maybe different type or undefine
  order.timeEstimated = order?.timeEstimated?.toDate();
  if (!order.accounting) {
    order.accounting = {
      food: {
        revenue: order.total - order.tax,
        tax: order.tax,
      },
      alcohol: {
        revenue: 0,
        tax: 0,
      },
    };
  }
  const serviceTax =
    Math.round(order.tip * (1 - 1 / (1 + serviceTaxRate)) * multiple) /
    multiple;
  order.accounting.service = {
    revenue: order.tip,
    tax: serviceTax,
  };
  order.type = orderType(order);
  if (!hasAccounting(order)) {
    throw new Error("order2ReportData: accounting was not filled");
  }
  return order;
};
