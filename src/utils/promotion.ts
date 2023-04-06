import {
  ref,
  watch,
  watchEffect,
  computed,
  ComputedRef,
} from "vue";

import {
  getDoc,
  getDocs,
  query,
  doc,
  collection,
  where,
  documentId,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";

import {
  sha256,
  arrayChunk,
} from "@/utils/utils";

import { db } from "@/lib/firebase/firebase9";

import { OrderInfoData } from "@/models/orderInfo";
import { PromotionData } from "@/models/promotion";

export const getPromotionCollctionPath = (isInMo: boolean, id: string) => {
  return isInMo ? `/groups/${id}/promotions` : `restaurants/${id}/promotions`;
};

export const getPromotionDocumentPath = (isInMo: boolean, id: string, promotionId: string) => {
  const basePath = getPromotionCollctionPath(isInMo, id);
  const path = `${basePath}/${promotionId}`;
  return path;
};

export const getPromotion = async (isInMo: boolean, id: string, promotionId: string) => {
  const path = getPromotionDocumentPath(isInMo, id, promotionId);
  const promotionDoc = await getDoc(doc(db, path))
  return promotionDoc.data() as PromotionData;
};


export const usePromotionsForAdmin = (isInMo: boolean, id: string) => {
  const promotionDataSet = ref<PromotionData[]>([]);

  (async () => {
    const promotionPath = getPromotionCollctionPath(isInMo, id);
    onSnapshot(
      query(
        collection(db, promotionPath),
      ),
      (ret1) => {
        promotionDataSet.value = ret1.docs.map(a => a.data() as PromotionData);
      }
    );
  })();
  return {
    promotionDataSet,
  };
};

export const usePromotions = (mode: string, id: string, user: any) => {
  const promotionData = ref<PromotionData[]>([]);

  (async () => {
    const promotionPath = getPromotionCollctionPath((mode === "mo"), id);

    const p: PromotionData[] = [];
    await Promise.all([
      getDocs(
        query(
          collection(db, promotionPath),
          where("enable", "==", true),
          where("hasTerm", "==", false),
        )
      ).then((ret1) => {
        const res = ret1.docs.map(a => a.data() as PromotionData);
        res.map(a => p.push(a));
      }),
      getDocs(
        query(
          collection(db, promotionPath),
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
    promotionData.value = p;

  })();

  const promotionUsed = ref<{[key: string]: PromotionData | PromotionData[]} | null>(null);
  watch([user, promotionData], async () => {
    if (promotionData.value.length > 0) {
      if (!user.value || !user.value.phoneNumber) {
        promotionUsed.value = {};
        return
      }
      const keys: string[] = [];
      const values: string[] = [];
      promotionData.value.map(a => {
        if (["discount", "onetimeCoupon"].includes(a.type) && a.usageRestrictions) {
          keys.push(a.promotionId);
        } else {
          values.push(a.promotionId);
        }
      });
      const userPath = await(async () => {
        if (mode === "mo") {
          const hash = await sha256([id, user.value.phoneNumber].join(":")); 
          return `groups/${id}/users/${hash}/promotionHistories`
        }
        return `users/${user.value.uid}/promotionHistories`;
      })();
      const used: {[key: string]: PromotionData | PromotionData[]} = {};
      await Promise.all([
        // for onetime or discount
        keys.length > 0 ?
          getDocs(
            query(
              collection(db, userPath),
              where(documentId(), "in", keys)
            )
          ).then(a => {
            a.docs.map((b) => {
              used[b.id] = b.data() as PromotionData;
            });
          }) :
          Promise.resolve(1),
        // for multiple times
        values.length > 0 ?
          getDocs(
            query(
              collection(db, userPath),
              where("promotionId", "in", values)
            )
          ).then(a => {
            a.docs.map((b) => {
              if (!used[b.id]) {
                used[b.id] = [] as PromotionData[];
              }
              (used[b.id] as PromotionData[]).push(b.data() as PromotionData);
            });
          }) : Promise.resolve(1)
      ]);
      promotionUsed.value = used;
    }
  });
  const promotions = computed(() => {
    if (promotionUsed.value !== null) {
      const ret = promotionData.value.filter(a => {
        if (!a.usageRestrictions) {
          return true;
        }
        if (a.type == "multipletimesCoupon") {
          // TODO
          
        } else if (a.type == "onetimeCoupon") {
          return !((promotionUsed.value || {})[a?.promotionId] as any).used;
        } else {
          // discount case.
          return !(promotionUsed.value || {})[a?.promotionId];
        }
      });
      return ret;
    }
    return [];
  });
  
  return {
    promotions,
  };
  
};


export const usePromotionData = (orderInfo: OrderInfoData, promotion: ComputedRef<PromotionData | null>) => {

  const enablePromotion = ref(false);
  const discountPrice = ref(0);

  watchEffect(() => {
    if (orderInfo && promotion && promotion.value) {
      enablePromotion.value = orderInfo.total >= promotion.value.discountThreshold;
      if (promotion.value.discountMethod === 'amount') {
        discountPrice.value = promotion.value.discountValue;
      } else {
        discountPrice.value = Number(promotion.value.discountValue * orderInfo.total / 100);
      }
    }
  });

  const isEnablePaymentPromotion = (payStripe: boolean) => {
    if (!promotion.value) {
      return false;
    }
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

export const useUserPromotionHistory = (mode: string, id: string, user: any) => {
  const discountHistory = ref<any[]>([]);
  (async () => {
    if (!user.value || !user.value.phoneNumber) {
      return 
    }
    const userPath = await(async () => {
      if (mode === "mo") {
        const hash = await sha256([id, user.value.phoneNumber].join(":")); 
        return `groups/${id}/users/${hash}/promotionHistories`
      }
      return `users/${user.value.uid}/promotionHistories`;
    })();
    const historySnapShot = await getDocs(collection(db, userPath))

    const promotionPath = getPromotionCollctionPath((mode === "mo"), id);
    if (historySnapShot.docs && historySnapShot.docs.length > 0) {
      const userHistory = historySnapShot.docs.map(a => {
        return { userHistory: a.data(), history: {} };
      });
      const promotionIds =  Array.from(new Set(userHistory.map(a => a.userHistory.promotionId)));
      const histories: {[key: string]: any } = {};
      await Promise.all(arrayChunk(promotionIds, 10).map(async(ids) => {
        const ret = await getDocs(query(
          collection(db, promotionPath),
          where(documentId(), "in", ids)
        ));
        ret.docs.map(a => {
          histories[a.id] = a.data();
        });
      }));
      
      userHistory.map(a => {
        a.history = histories[a.userHistory.promotionId];
      });
      discountHistory.value = userHistory;
      // console.log(userHistory, promotionIds, histories);
    };
  })();

  return {
    discountHistory
  };

  
};
