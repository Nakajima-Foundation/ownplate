import {
  ref,
  onUnmounted,
  computed,
  Ref,
  ComputedRef,
  
} from "vue";

import { db } from "@/lib/firebase/firebase9";
import {
  query,
  onSnapshot,
  getDocs,
  collection,
  collectionGroup,
  where,
  limit,
  startAfter,
  orderBy,
  QueryDocumentSnapshot,
} from "firebase/firestore";

import { doc2data, array2obj } from "@/utils/utils";
import { useRoute } from "vue-router";
import { MenuData, TitleData } from "@/models/menu";

export const useTitles = (restaurantId: Ref) => {
  const titles = ref<TitleData[]>([]);

  const titleDetacher = ref();
  const detacheTitle = () => {
    if (titleDetacher.value) {
      titleDetacher.value();
    }
  };
  onUnmounted(() => {
    detacheTitle();
  });

  const loadTitle = () => {
    detacheTitle();
    titleDetacher.value = onSnapshot(
      query(
        collection(db, `restaurants/${restaurantId.value}/titles`),
        where("deletedFlag", "==", false)
      ),
      (title) => {
        if (!title.empty) {
          titles.value = title.docs.map(doc2data("title"));
        }
      }
    );
  };
  const titleLists = computed(() => {
    return titles.value.filter((title) => title.name !== "");
  });

  return {
    loadTitle,
    titles,
    titleLists,
  };
};

export const useMenu = (
  restaurantId: Ref<string>,
) => {
  const menuCache = ref<MenuData[]>([]);
  const menuDetacher = ref();

  const menus = computed(() => {
    return menuCache.value;
  });

  const detacheMenu = () => {
    if (menuDetacher.value) {
      menuDetacher.value();
    }
  };
  const menuPath = computed(() => {
    return `restaurants/${restaurantId.value}/menus`;
  });
  const setCache = (cache: any) => {
    menuCache.value = cache;
  };
  const loadMenu = async (callback?: () => void) => {
    detacheMenu();
    if (menuCache.value.length > 0) {
      return;
    }

    const path = menuPath.value;

    const menuQuery = query(
      collection(db, menuPath.value),
      where("deletedFlag", "==", false),
      where("publicFlag", "==", true)
    );

    menuDetacher.value = onSnapshot(query(menuQuery), (menu) => {
      if (!menu.empty) {
        const ret = menu.docs
          .filter((a) => {
            const data = a.data();
            return data.validatedFlag === undefined || data.validatedFlag;
          })
          .map(doc2data("menu")) as MenuData[];
        menuCache.value = ret;
        if (callback) {
          callback();
        }
      } else {
        menuCache.value = [];
      }
    });
  };

  const menuObj = computed(() => {
    return array2obj(menus.value);
  });

  return {
    loadMenu,
    setCache,
    menus,
    menuObj,
    menuCache,
  };
};


