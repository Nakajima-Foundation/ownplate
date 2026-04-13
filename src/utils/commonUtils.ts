interface PostageInfo {
  freeThreshold: number;
  postageList: { [key: string]: number[] };
}

export const costCal = (
  postageInfo: Partial<PostageInfo> | null | undefined,
  prefectureId: number,
  total: number,
) => {
  const postageList = postageInfo?.postageList?.default || [];
  const freeThreshold = postageInfo?.freeThreshold || null;
  if (freeThreshold !== null) {
    if (total >= freeThreshold) {
      return 0;
    }
  }
  if (prefectureId && postageList.length > 0) {
    return Number(postageList[prefectureId - 1]);
  }
  return 0;
};

export const isNull = (value: unknown): value is null | undefined => {
  return value === null || value === undefined;
};

export const isEmpty = (value: unknown): boolean => {
  return value === null || value === undefined || String(value) === "";
};
