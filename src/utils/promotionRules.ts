import type {
  DiscountMethod,
  PaymentRestrictions,
  PromotionType,
} from "../models/common";

export const getPromotionCollctionPath = (id: string) => {
  return `restaurants/${id}/promotions`;
};

export const getPromotionDocumentPath = (id: string, promotionId: string) => {
  const basePath = getPromotionCollctionPath(id);
  const path = `${basePath}/${promotionId}`;
  return path;
};

// 使用履歴は客ごと。ここを取り違えると、他の客の履歴で使用済みと判定する。
export const userPromotionHistoryPath = (uid: string) =>
  `users/${uid}/promotionHistories`;

// 丸めていないのは、サーバ側（functions の getDiscountPrice）も丸めていないため。
// 片方だけ丸めると、客が見た額と請求額がずれる。
export const promotionDiscount = (
  total: number,
  promotion: {
    discountThreshold: number;
    discountMethod: DiscountMethod;
    discountValue: number;
  },
): { enabled: boolean; discountPrice: number } => ({
  enabled: total >= promotion.discountThreshold,
  discountPrice:
    promotion.discountMethod === "amount"
      ? Number(promotion.discountValue)
      : Number((promotion.discountValue * total) / 100),
});

export const isPaymentAllowed = (
  promotion: { paymentRestrictions: PaymentRestrictions } | null | undefined,
  payStripe: boolean,
): boolean => {
  if (!promotion) {
    return false;
  }
  if (promotion.paymentRestrictions === "stripe") {
    return payStripe;
  }
  if (promotion.paymentRestrictions === "instore") {
    return !payStripe;
  }
  return true;
};

// 管理画面の一覧の並び。いま使える券を上に、止めた券を下に。
// 同じ段のものは、期間つきを先に、そのなかでは始まりが遅いものを先に。
export const compareForAdmin = (
  a: {
    currentOpen: boolean;
    enable: boolean;
    hasTerm: boolean;
    termFrom: Date;
  },
  b: {
    currentOpen: boolean;
    enable: boolean;
    hasTerm: boolean;
    termFrom: Date;
  },
): number => {
  if (a.currentOpen !== b.currentOpen) {
    return a.currentOpen ? -1 : 1;
  }
  if (a.enable !== b.enable) {
    return a.enable ? -1 : 1;
  }
  if (a.hasTerm !== b.hasTerm) {
    return a.hasTerm ? -1 : 1;
  }
  return a.termFrom > b.termFrom ? -1 : 1;
};

// 客に出す一覧の並び。割引の小さいものから。
export const compareForCustomer = (
  a: { discountValue: number },
  b: { discountValue: number },
): number => (a.discountValue > b.discountValue ? 1 : -1);

// 期間つきの券は、Firestore 側で「終わっていない」ものだけを引いている。
// 始まっているかはここで見る。
export const hasStarted = (promotion: { termFrom: Date }, now: Date): boolean =>
  promotion.termFrom < now;

// 使用履歴の引き方が2通りある。**一度きりの券は文書 id が券の id そのもの**なので
// id で引く。何度も使える券は履歴が複数あるので、中の promotionId で引く。
export const splitPromotionIdsByLookup = (
  promotions: {
    type: PromotionType;
    usageRestrictions: boolean;
    promotionId: string;
  }[],
): { byDocumentId: string[]; byField: string[] } =>
  promotions.reduce<{ byDocumentId: string[]; byField: string[] }>(
    (tmp, promotion) => {
      if (
        ["discount", "onetimeCoupon"].includes(promotion.type) &&
        promotion.usageRestrictions
      ) {
        tmp.byDocumentId.push(promotion.promotionId);
      } else {
        tmp.byField.push(promotion.promotionId);
      }
      return tmp;
    },
    { byDocumentId: [], byField: [] },
  );

export type PromotionUsage = { used?: boolean };
export type PromotionUsageByKey = {
  [key: string]: PromotionUsage | PromotionUsage[];
};

// まだ使える券だけを残す。履歴がまだ来ていないあいだは何も出さない
// （出すと、使い切った券が選べる状態で表示される）。
export const usablePromotions = <
  T extends {
    usageRestrictions: boolean;
    type: PromotionType;
    data: { promotionId: string };
  },
>(
  promotions: T[],
  used: PromotionUsageByKey | null,
): T[] => {
  if (used === null) {
    return [];
  }
  return promotions.filter((promotion) => {
    if (!promotion.usageRestrictions) {
      return true;
    }
    if (promotion.type === "multipletimesCoupon") {
      // TODO
    } else if (promotion.type === "onetimeCoupon") {
      const history = (used || {})[promotion?.data.promotionId];
      if (Array.isArray(history)) {
        return true;
      }
      return !history?.used;
    }
    // discount case.
    return !(used || {})[promotion?.data.promotionId];
  });
};
