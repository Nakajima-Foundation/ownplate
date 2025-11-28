// Postage fee mapping by prefecture ID
// Key: Prefecture ID (string), Value: Postage fee (number)
export type PostageData = Record<string, number>;

// Delivery fee and minimum amount configuration by area
export interface DeliveryAreaConfig {
  fee?: number;           // Delivery fee for this area
  minAmount?: number;     // Minimum order amount for delivery
}

// Delivery data mapping by area ID
// Key: Area ID (string), Value: Delivery configuration
export type DeliveryData = Record<string, DeliveryAreaConfig>;
