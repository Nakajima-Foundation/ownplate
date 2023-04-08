import {
  ref,
  watch,
  watchEffect,
  computed,
  ComputedRef,
  onUnmounted,
} from "@vue/composition-api";

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
  Unsubscribe,
} from "firebase/firestore";

import {
  sha256,
  arrayChunk,
} from "@/utils/utils";

import { db } from "@/lib/firebase/firebase9";

import { OrderInfoData } from "@/models/orderInfo";
import Promotion, { PromotionData, UserPromotionHistoryData } from "@/models/promotion";

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
  const promotionDataSet = ref<Promotion[]>([]);

  (async () => {
    const promotionPath = getPromotionCollctionPath(isInMo, id);
    onSnapshot(
      query(
        collection(db, promotionPath),
      ),
      (ret1) => {
        promotionDataSet.value = ret1.docs.map(a => new Promotion(a));
      }
    );
  })();
  return {
    promotionDataSet,
  };
};

const getUserHistoryPath = async (mode: string, id: string, user: any) => {
  if (mode === "mo") {
    const hash = await sha256([id, user.value.phoneNumber].join(":")); 
    return `groups/${id}/users/${hash}/promotionHistories`
  }
  return `users/${user.value.uid}/promotionHistories`;
}
const getHistoryCondition = (mode: string, id: string) => {
  if (mode === "mo") {
    return where("grouoId", "==", id);
  }
  return where("restaurantId", "==", id);
}

export const usePromotions = (mode: string, id: string, user: any) => {
  const promotionData = ref<Promotion[]>([]);

  (async () => {
    const promotionPath = getPromotionCollctionPath((mode === "mo"), id);

    const p: Promotion[] = [];
    await Promise.all([
      getDocs(
        query(
          collection(db, promotionPath),
          where("enable", "==", true),
          where("hasTerm", "==", false),
        )
      ).then((ret1) => {
        const res = ret1.docs.map(a => new Promotion(a));
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
        const res = ret1.docs.map(a =>  new Promotion(a)).filter((a) => {
          return a.termFrom < new Date();
        });
        res.map(a => p.push(a));
      })
    ]);
    promotionData.value = p.sort((a, b) => {
      return a.discountValue > b.discountValue ? 1 : -1;
    });

  })();

  
  const promotionUsed = ref<{[key: string]: UserPromotionHistoryData | UserPromotionHistoryData[]} | null>(null);
  let detacher1: Unsubscribe | null = null;
  let detacher2: Unsubscribe | null = null;
  onUnmounted(() => {
    if (detacher1) {
      detacher1();
    }
    if (detacher2) {
      detacher2();
    }
  });
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
      // TODO set condition
      const userHistoryPath = await getUserHistoryPath(mode, id, user);

      // for onetime or discount
      if (keys.length === 0 && values.length === 0) {
        promotionUsed.value = {};
        return;
      }
      detacher1 = keys.length > 0 ?
        onSnapshot(
          query(
            collection(db, userHistoryPath),
            where(documentId(), "in", keys),
            getHistoryCondition(mode, id),
          ),
          (a => {
            const used = promotionUsed.value ? {...promotionUsed.value} : {};
            a.docs.map((b) => {
              used[b.id] = b.data() as UserPromotionHistoryData;
            })
            promotionUsed.value = used;
          })) : null;
      
      // for multiple times
      detacher2 = values.length > 0 ?
        onSnapshot(
          query(
            collection(db, userHistoryPath),
            where("promotionId", "in", values),
            getHistoryCondition(mode, id),
          ),
          (a => {
            const used = promotionUsed.value ? {...promotionUsed.value} : {};
            a.docs.map((b) => {
              if (!used[b.id]) {
                used[b.id] = [] as UserPromotionHistoryData[];
              }
              (used[b.id] as UserPromotionHistoryData[]).push(b.data() as UserPromotionHistoryData);
            });
            promotionUsed.value = used;
          })) : null;
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
          return !((promotionUsed.value || {})[a?.data.promotionId] as any).used;
        } else {
          // discount case.
          return !(promotionUsed.value || {})[a?.data.promotionId];
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

export const usePromotionData = (orderInfo: OrderInfoData, promotion: ComputedRef<Promotion | null>) => {
  const enablePromotion = ref(false);
  const discountPrice = ref(0);

  watchEffect(() => {
    if (orderInfo && promotion && promotion.value) {
      enablePromotion.value = orderInfo.total >= promotion.value.discountThreshold;
      if (promotion.value.discountMethod === 'amount') {
        discountPrice.value = Number(promotion.value.discountValue);
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
    const userHistoryPath = await getUserHistoryPath(mode, id, user);
    const historySnapShot = await getDocs(collection(db, userHistoryPath))
    
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
