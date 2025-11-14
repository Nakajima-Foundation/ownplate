export interface PostageData {
  [prefectureId: string]: number;
}

export interface DeliveryData {
  [areaId: string]: {
    fee?: number;
    minAmount?: number;
  };
}
