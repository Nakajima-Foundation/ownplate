import {
  ref,
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
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase9";

import {
  arrayChunk,
} from "@/utils/utils";

import moment from "moment-timezone";

import { OrderInfoData } from "@/models/orderInfo";

export const useHasSoldOutToday = (restaurantId: string, orderInfo: OrderInfoData) => {
  const hasSoldOutToday = ref(false);
  const mendIds = Object.keys(orderInfo.order);

  const today = moment().format("YYYY-MM-DD");

  // todo listen
  arrayChunk(mendIds, 10).map(async(ids) => {
    const ret = await getDocs(query(
      collection(db, `restaurants/${restaurantId}/menus`),
      where(documentId(), "in", ids)
    ));
    ret.docs.map(a => {
      const d = a.data();
      if (d.soldOutToday === today) {
        hasSoldOutToday.value = true;
      }
    });
  });

  return {
    hasSoldOutToday
  };
};
