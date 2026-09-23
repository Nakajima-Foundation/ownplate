import type { DiscountMethod, PaymentRestrictions } from "@/models/common";

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
