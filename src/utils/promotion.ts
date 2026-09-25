import {
  ref,
  watch,
  watchEffect,
  computed,
  ComputedRef,
  onUnmounted,
} from "vue";

import { User } from "firebase/auth";

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

import { arrayChunk } from "@/utils/utils";

import { db } from "@/lib/firebase/firebase9";

import { OrderInfoData } from "@/models/orderInfo";
import Promotion, {
  PromotionData,
  UserPromotionHistoryData,
} from "@/models/promotion";

import {
  compareForAdmin,
  compareForCustomer,
  getPromotionCollctionPath,
  getPromotionDocumentPath,
  hasStarted,
  isPaymentAllowed,
  promotionDiscount,
  splitPromotionIdsByLookup,
  usablePromotions,
  userPromotionHistoryPath,
} from "@/utils/promotionRules";

export const getPromotion = async (id: string, promotionId: string) => {
  const path = getPromotionDocumentPath(id, promotionId);
  const promotionDoc = await getDoc(doc(db, path));
  return promotionDoc.data() as PromotionData;
};

export const usePromotionsForAdmin = (id: string) => {
  const promotionDataSet = ref<Promotion[]>([]);
  (() => {
    const promotionPath = getPromotionCollctionPath(id);
    onSnapshot(query(collection(db, promotionPath)), (ret1) => {
      promotionDataSet.value = ret1.docs
        .map((a) => new Promotion(a))
        .sort(compareForAdmin);
    });
  })();
  return {
    promotionDataSet,
  };
};

type UserRef = ComputedRef<undefined | null | User>;

const isUser = (v: undefined | null | User): v is User => {
  return typeof v === "object" && v !== null;
};

const getUserHistoryPath = (id: string, user: UserRef) => {
  if (!isUser(user.value)) {
    throw new Error("user is not authenticated");
  }
  return userPromotionHistoryPath(user.value.uid);
};
const getHistoryCondition = (id: string) => {
  return where("restaurantId", "==", id);
};

export const usePromotions = (id: string, user: UserRef) => {
  const promotionData = ref<Promotion[]>([]);

  (async () => {
    const promotionPath = getPromotionCollctionPath(id);

    const p: Promotion[] = [];
    await Promise.all([
      getDocs(
        query(
          collection(db, promotionPath),
          where("enable", "==", true),
          where("hasTerm", "==", false),
        ),
      ).then((ret1) => {
        const res = ret1.docs.map((a) => new Promotion(a));
        res.map((a) => p.push(a));
      }),
      getDocs(
        query(
          collection(db, promotionPath),
          where("enable", "==", true),
          where("hasTerm", "==", true),
          // where("termFrom", ">=", Timestamp.now()),
          where("termTo", ">", Timestamp.now()),
        ),
      ).then((ret1) => {
        const res = ret1.docs
          .map((a) => new Promotion(a))
          .filter((a) => hasStarted(a, new Date()));
        res.map((a) => p.push(a));
      }),
    ]);
    promotionData.value = p.sort(compareForCustomer);
  })();

  const promotionUsed = ref<{
    [key: string]: UserPromotionHistoryData | UserPromotionHistoryData[];
  } | null>(null);
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
  watch([user, promotionData], () => {
    if (promotionData.value.length > 0) {
      if (!isUser(user.value) || !user.value.phoneNumber) {
        promotionUsed.value = {};
        return;
      }
      const { byDocumentId: keys, byField: values } = splitPromotionIdsByLookup(
        promotionData.value,
      );
      // TODO set condition
      const userHistoryPath = getUserHistoryPath(id, user);

      // for onetime or discount
      if (keys.length === 0 && values.length === 0) {
        promotionUsed.value = {};
        return;
      }
      detacher1 =
        keys.length > 0
          ? onSnapshot(
              query(
                collection(db, userHistoryPath),
                where(documentId(), "in", keys),
                getHistoryCondition(id),
              ),
              (a) => {
                const used = promotionUsed.value
                  ? { ...promotionUsed.value }
                  : {};
                a.docs.forEach((b) => {
                  used[b.id] = b.data() as UserPromotionHistoryData;
                });
                promotionUsed.value = used;
              },
            )
          : null;

      // for multiple times
      detacher2 =
        values.length > 0
          ? onSnapshot(
              query(
                collection(db, userHistoryPath),
                where("promotionId", "in", values),
                getHistoryCondition(id),
              ),
              (a) => {
                const used = promotionUsed.value
                  ? { ...promotionUsed.value }
                  : {};
                a.docs.forEach((b) => {
                  const existing = used[b.id];
                  const list: UserPromotionHistoryData[] = Array.isArray(
                    existing,
                  )
                    ? existing
                    : [];
                  list.push(b.data() as UserPromotionHistoryData);
                  used[b.id] = list;
                });
                promotionUsed.value = used;
              },
            )
          : null;
    }
  });
  const promotions = computed(() =>
    usablePromotions(promotionData.value, promotionUsed.value),
  );

  return {
    promotions,
  };
};

export const usePromotionData = (
  orderInfo: OrderInfoData,
  promotion: ComputedRef<Promotion | null>,
) => {
  const enablePromotion = ref(false);
  const discountPrice = ref(0);

  watchEffect(() => {
    if (orderInfo && promotion && promotion.value) {
      const discount = promotionDiscount(orderInfo.total, promotion.value);
      enablePromotion.value = discount.enabled;
      discountPrice.value = discount.discountPrice;
    }
  });

  const isEnablePaymentPromotion = (payStripe: boolean) =>
    isPaymentAllowed(promotion.value, payStripe);

  return {
    enablePromotion,
    discountPrice,
    isEnablePaymentPromotion,
  };
};

type DiscountHistoryItem = {
  userHistory: UserPromotionHistoryData;
  history: PromotionData | Record<string, never>;
};

export const useUserPromotionHistory = (id: string, user: UserRef) => {
  const discountHistory = ref<DiscountHistoryItem[]>([]);
  (async () => {
    if (!isUser(user.value) || !user.value.phoneNumber) {
      return;
    }
    const userHistoryPath = getUserHistoryPath(id, user);
    const historySnapShot = await getDocs(collection(db, userHistoryPath));

    const promotionPath = getPromotionCollctionPath(id);
    if (historySnapShot.docs && historySnapShot.docs.length > 0) {
      const userHistory: DiscountHistoryItem[] = historySnapShot.docs.map(
        (a) => {
          return {
            userHistory: a.data() as UserPromotionHistoryData,
            history: {},
          };
        },
      );
      const promotionIds = Array.from(
        new Set(userHistory.map((a) => a.userHistory.promotionId)),
      );
      const histories: { [key: string]: PromotionData } = {};
      await Promise.all(
        arrayChunk(promotionIds, 10).map(async (ids) => {
          const ret = await getDocs(
            query(
              collection(db, promotionPath),
              where(documentId(), "in", ids),
            ),
          );
          ret.docs.forEach((a) => {
            histories[a.id] = a.data() as PromotionData;
          });
        }),
      );

      userHistory.forEach((a) => {
        a.history = histories[a.userHistory.promotionId];
      });
      discountHistory.value = userHistory;
      // console.log(userHistory, promotionIds, histories);
    }
  })();

  return {
    discountHistory,
  };
};
