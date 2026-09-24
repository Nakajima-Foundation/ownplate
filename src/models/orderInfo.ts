import { ownPlateConfig } from "@/config/project";
import { orderType } from "@/utils/utils";
import { stripe_regions_jp } from "../config/constant";
import { OrderInfoData } from "./orderInfoData";
export type { OrderInfoData } from "./orderInfoData";

type OrderAccounting = NonNullable<OrderInfoData["accounting"]>;

export type ReportRow = OrderInfoData & {
  accounting: OrderAccounting & {
    service: NonNullable<OrderAccounting["service"]>;
  };
};

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
  const accounting = order.accounting || {
    food: {
      revenue: order.total - order.tax,
      tax: order.tax,
    },
    alcohol: {
      revenue: 0,
      tax: 0,
    },
  };
  const serviceTax =
    ownPlateConfig.region === "JP"
      ? Math.round(order.tip * (1 - 1 / (1 + serviceTaxRate)) * multiple) /
        multiple
      : 0;
  const accountingWithService = Object.assign(accounting, {
    service: {
      revenue: order.tip,
      tax: serviceTax,
    },
  });
  order.type = orderType(order);
  return Object.assign(order, { accounting: accountingWithService });
};
