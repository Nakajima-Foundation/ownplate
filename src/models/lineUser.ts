// restaurants/:restaurantId/lineUsersData/:uid。functions の LINE 連携（line.ts）が、
// LINE の profile API の返りをそのまま書く。
export type LineUserData = {
  profile: {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    statusMessage?: string;
    language?: string;
  };
};
