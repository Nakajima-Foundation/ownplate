export interface RestaurantInfoData {
  url: string;
  restaurantName: string;
  restCoverPhoto: string;

  zip: string;
  state: string;
  city: string;
  streetAddress: string;

  introduction: string;
  menuLists: string[];
}

export class RestaurantInfo {}
