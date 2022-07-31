import {
  ref,
  computed,
  onUnmounted,
  Ref,
} from "@vue/composition-api";
import { db } from "@/lib/firebase/firebase9";
import {
  collection,
  query,
  where,
  onSnapshot,
  DocumentData,
  Unsubscribe,
} from "firebase/firestore";
import {
  doc2data,
  array2obj,
} from "@/utils/utils";
  
export const useMenuAndTitle = (menuRestaurantId: Ref<string>) => {
  const menus = ref<DocumentData[] | null >(null);
  const titles = ref<DocumentData[] | null >(null);
  const menuObj = ref({});
  const detachers = ref<Unsubscribe[]>([]);
  
  const menu_detacher = onSnapshot(
    query(
      collection(db, `restaurants/${menuRestaurantId.value}/menus`),
      where("deletedFlag", "==", false)
    ),
    (results) => {
      menus.value = (results.empty ? [] : results.docs).map(doc2data("menu"));
    }
  );
  const title_detacher = onSnapshot(
    query(
      collection(db, `restaurants/${menuRestaurantId.value}/titles`),
      where("deletedFlag", "==", false)
    ),
    (results) => {
      titles.value = (results.empty ? [] : results.docs).map(doc2data("title"));
    }
  );
  detachers.value = [menu_detacher, title_detacher];

  const itemsObj = computed(() => {
    if (menus.value && titles.value) {
      menuObj.value = array2obj(menus.value);
      return array2obj(menus.value.concat(titles.value));
    }
    return {};
  });

  onUnmounted(() => {
    if (detachers.value) {
      detachers.value.map((detacher) => {
        detacher();
      });
      detachers.value = [];
    }
  });
  const numberOfMenus = computed(() => {
    return (menus.value || []).length;
  });
  return {
    menuObj,
    itemsObj,
    numberOfMenus,
  };
  
  
}
