import type { Timestamp } from "./firebaseUtils";

// users/:uid/reviews/:restaurantId。お店のお気に入りボタン（FavoriteButton.vue）が書く。
export interface ReviewData {
  restaurantId?: string;
  restaurantName?: string;
  restProfilePhoto?: string;
  likes?: boolean;
  timeLiked?: Timestamp;
}
