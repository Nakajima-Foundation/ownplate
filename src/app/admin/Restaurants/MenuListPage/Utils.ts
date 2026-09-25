import { ref, computed, onUnmounted, Ref } from "vue";
import { db } from "@/lib/firebase/firebase9";
import {
  collection,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { doc2data, array2obj } from "@/utils/utils";
import type { MenuData, TitleData } from "@/models/menu";

export const useMenuAndTitle = (menuRestaurantId: Ref<string>) => {
  const menus = ref<MenuData[] | null>(null);
  const menuCache = ref<{ [key: string]: MenuData[] }>({});
  const menuDetacher = ref<Unsubscribe | null>(null);
  const detacheMenu = () => {
    if (menuDetacher.value) {
      menuDetacher.value();
    }
  };

  const titles = ref<TitleData[] | null>(null);
  const menuObj = ref<{ [key: string]: MenuData }>({});
  const isLoading = ref(true);

  const loadMenu = () => {
    detacheMenu();
    const cacheKey = "mono";
    if (menuCache.value[cacheKey]) {
      menus.value = menuCache.value[cacheKey];
      return;
    }
    isLoading.value = true;

    const menuQuery = query(
      collection(db, `restaurants/${menuRestaurantId.value}/menus`),
      where("deletedFlag", "==", false),
    );
    menuDetacher.value = onSnapshot(
      query(menuQuery),
      (results) => {
        menus.value = (results.empty ? [] : results.docs).map(
          doc2data<MenuData>("menu"),
        );
        isLoading.value = false;
      },

      (e) => {
        console.log(e);
      },
    );
  };

  const titleDetacher = onSnapshot(
    query(
      collection(db, `restaurants/${menuRestaurantId.value}/titles`),
      where("deletedFlag", "==", false),
    ),
    (results) => {
      titles.value = (results.empty ? [] : results.docs).map(
        doc2data<TitleData>("title"),
      );
    },
  );

  const itemsObj = computed(() => {
    if (menus.value && titles.value) {
      menuObj.value = array2obj(menus.value);
      // concat は要素の型が違うと受け付けないので展開で繋ぐ。素の配列なので結果は同じ。
      const items: (MenuData | TitleData)[] = [...menus.value, ...titles.value];
      return array2obj(items);
    }
    return {};
  });

  onUnmounted(() => {
    detacheMenu();
    titleDetacher();
  });
  const numberOfMenus = computed(() => {
    return (menus.value || []).length;
  });
  return {
    menuObj,
    itemsObj,
    numberOfMenus,
    loadMenu,
    isLoading,
  };
};
