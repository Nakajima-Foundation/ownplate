import { ref, onUnmounted, computed, Ref } from "vue";

import { db } from "@/lib/firebase/firebase9";
import { query, onSnapshot, collection, where } from "firebase/firestore";

import { doc2data, array2obj } from "@/utils/utils";
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
        where("deletedFlag", "==", false),
      ),
      (title) => {
        if (!title.empty) {
          titles.value = title.docs.map(doc2data("title"));
        }
      },
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

export const useMenu = (restaurantId: Ref<string>) => {
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
  const setCache = (cache: MenuData[]) => {
    menuCache.value = cache;
  };
  const loadMenu = (callback?: () => void) => {
    detacheMenu();
    if (menuCache.value.length > 0) {
      return;
    }

    const menuQuery = query(
      collection(db, `restaurants/${restaurantId.value}/menus`),
      where("deletedFlag", "==", false),
      where("publicFlag", "==", true),
    );

    menuDetacher.value = onSnapshot(query(menuQuery), (menu) => {
      if (menu.empty) {
        menuCache.value = [];
      } else {
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
