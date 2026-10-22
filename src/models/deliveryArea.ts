// restaurants/:restaurantId/delivery/area。管理画面の配達設定（admin/Restaurants/Delivery.vue）が書く。
export type DeliveryAreaData = {
  enableAreaMap: boolean;
  enableAreaText: boolean;
  radius: number;
  areaText: string;
  enableDeliveryFree: boolean;
  enableDeliveryThreshold: boolean;
  deliveryFee: number;
  deliveryFreeThreshold: number;
  deliveryThreshold: number;
  uid: string;
};
