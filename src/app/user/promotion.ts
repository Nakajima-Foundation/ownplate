import {
  ref,
  watch,
  ComputedRef,
} from "@vue/composition-api";

import {
  getDocs,
  query,
  collection,
  where,
  documentId,
  Timestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firebase9";

import { OrderInfoData } from "@/models/orderInfo";
import { PromotionData } from "@/models/promotion";

export const usePromitions = (mode: string, id: string, user: any) => {
  const promotions = ref<PromotionData[]>([]);

  (async () => {
    const path = (mode === "mo") ?  `/groups/${id}/promotions` :  `restaurants/${id}/promotions`;

    const p: PromotionData[] = [];
    await Promise.all([
      getDocs(
        query(
          collection(db, `/groups/${id}/promotions`),
          where("enable", "==", true),
          where("hasTerm", "==", false),
        )
      ).then((ret1) => {
        const res = ret1.docs.map(a => a.data() as PromotionData);
        res.map(a => p.push(a));
      }),
      getDocs(
        query(
          collection(db, `/groups/${id}/promotions`),
          where("enable", "==", true),
          where("hasTerm", "==", true),
          // where("termFrom", ">=", Timestamp.now()),
          where("termTo", ">", Timestamp.now()),
        )
      ).then((ret1) => {
        const res = ret1.docs.map(a => a.data() as PromotionData).filter((a) => {
          return a.termFrom.toDate() < new Date();
        });
        res.map(a => p.push(a));
      })
    ]);
    promotions.value = p;

  })();

  const promotionUsed = ref<{[key: string]: PromotionData}>({});
  watch([user, promotions], async () => {
    if (user.value && promotions.value.length > 0) {
      const keys: string[] = [];
      const values: string[] = [];
      promotions.value.map(a => {
        if (["discount", "onetimeCoupon"].includes(a.type)) {
          keys.push(a.promotionId);
        } else {
          values.push(a.promotionId);
        }
      });
      const path = `users/${user.value.uid}/promotions`;
      const used: {[key: string]: PromotionData} = {};
      await Promise.all([
        keys.length > 0 ?
          getDocs(
            query(
              collection(db, path),
              where(documentId(), "in", keys)
            )
          ).then(a => {
            a.docs.map((b) => {
              used[b.id] = b.data() as PromotionData;
            });
          }) :
          new Promise((r) => r(1)),
        //
        values.length > 0 ?
          getDocs(
            query(
              collection(db, path),
              where("promotionId", "in", values)
            )
          ).then(a => {
            a.docs.map((b) => {
              used[b.id] = b.data() as PromotionData;
            });
          }) :
          new Promise((r) => r(1))
      ])
      promotionUsed.value = used;
    }
  });
  
  
  return {
    promotions,
    promotionUsed,
  };
  
};


export const usePromotionData = (orderInfo: OrderInfoData, promotion: ComputedRef<PromotionData>) => {

  const enablePromotion = ref(false);
  const discountPrice = ref(0);
  if (orderInfo && promotion) {
    enablePromotion.value = orderInfo.total > promotion.value.discountThreshold;
    if (promotion.value.discountMethod === 'amount') {
      discountPrice.value = promotion.value.discountValue;
    } else {
      discountPrice.value = Number(promotion.value.discountValue * orderInfo.total / 100);
    }
  }
  const isEnablePaymentPromotion = (payStripe: boolean) => {
    if (promotion.value.paymentRestrictions === "stripe") {
      return payStripe;
    }
    if (promotion.value.paymentRestrictions === "instore") {
      return !payStripe;
    }
    return true;
  }
  
  return {
    enablePromotion,
    discountPrice,
    isEnablePaymentPromotion,
  };
};
