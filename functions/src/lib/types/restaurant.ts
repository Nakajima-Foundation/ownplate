import { RestaurantInfoData } from "../../models/RestaurantInfo";

export interface RestaurantPhoneData {
  countryCode: string;
  phoneNumber: string;
}

// Express extended request types
export interface RequestWithRestaurant extends Express.Request {
  restaurant?: RestaurantInfoData;
}
