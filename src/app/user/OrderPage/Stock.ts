import { ref } from "vue";

import { isSoldOutOn } from "@/utils/soldOut";
import {
  getDocs,
  query,
  collection,
  where,
  documentId,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase9";

import { arrayChunk } from "@/utils/utils";

import { OrderInfoData } from "@/models/orderInfo";
import { MenuData } from "@/models/menu";

export const useHasSoldOutToday = (
  restaurantId: string,
  orderInfo: OrderInfoData,
) => {
  const hasSoldOutToday = ref(false);
  const mendIds = Object.keys(orderInfo.order);

  const now = new Date();

  const menuData = ref<{ [key: string]: MenuData }>({});

  // todo listen
  arrayChunk(mendIds, 10).map(async (ids) => {
    const ret = await getDocs(
      query(
        collection(db, `restaurants/${restaurantId}/menus`),
        where(documentId(), "in", ids),
      ),
    );
    ret.docs.forEach((a) => {
      const d = a.data() as MenuData;
      menuData.value[a.id] = d;
      if (isSoldOutOn(d.soldOutToday, now)) {
        hasSoldOutToday.value = true;
      }
    });
  });

  return {
    hasSoldOutToday,
    menuData,
  };
};
