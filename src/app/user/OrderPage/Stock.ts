import { ref } from "vue";

import {
  getDocs,
  query,
  collection,
  where,
  documentId,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase9";

import { arrayChunk } from "@/utils/utils";

import moment from "moment-timezone";

import { OrderInfoData } from "@/models/orderInfo";
import { MenuData } from "@/models/menu";

export const useHasSoldOutToday = (
  restaurantId: string,
  orderInfo: OrderInfoData,
) => {
  const hasSoldOutToday = ref(false);
  const mendIds = Object.keys(orderInfo.order);

  const today = moment().format("YYYY-MM-DD");

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
      menuData.value[a.id as string] = d;
      if (d.soldOutToday === today) {
        hasSoldOutToday.value = true;
      }
    });
  });

  return {
    hasSoldOutToday,
    menuData,
  };
};
