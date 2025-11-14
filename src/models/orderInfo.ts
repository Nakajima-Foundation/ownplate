import { ownPlateConfig } from "@/config/project";
import { stripeRegion, orderType } from "@/utils/utils";
import { OrderInfoData } from "./orderInfoData";
export { OrderInfoData, OrderItemData } from "./orderInfoData"; 

export class OrderInfo {}

export const order2ReportData = (
  order: OrderInfoData,
  serviceTaxRate: number,
) => {
  const multiple = stripeRegion.multiple;
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
  if (ownPlateConfig.region === "JP") {
    const serviceTax =
      Math.round(order.tip * (1 - 1 / (1 + serviceTaxRate)) * multiple) /
      multiple;
    order.accounting.service = {
      revenue: order.tip,
      tax: serviceTax,
    };
  } else {
    order.accounting.service = {
      revenue: order.tip,
      tax: 0,
    };
  }
  order.type = orderType(order);
  return order;
};
