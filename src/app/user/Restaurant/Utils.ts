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
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";

import { doc2data, array2obj } from "@/utils/utils";
import { useRoute } from "vue-router";
import { MenuData } from "@/models/menu";

export const useTitles = (restaurantId: Ref) => {
  const titles = ref<DocumentData[]>([]);

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
  isInMo: ComputedRef<boolean | null>,
) => {
  const allMenuObj = ref<{ [key: string]: DocumentData[] }>({});
  const menuCache = ref<{ [key: string]: any }>({});
  const menuDetacher = ref();
  const loading: { [key: string]: boolean } = {};

  const allMenuObjKey = computed(() => {
    return "mono";
  });
  const menus = computed(() => {
    return allMenuObj.value[allMenuObjKey.value] || [];
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
    allMenuObj.value = cache;
    menuCache.value = cache;
  };
  const loadMenu = async (callback?: () => void) => {
    detacheMenu();
    if (menuCache.value[allMenuObjKey.value]) {
      allMenuObj.value[allMenuObjKey.value] =
        menuCache.value[allMenuObjKey.value];
      return;
    }

    const key = allMenuObjKey.value;
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
          .map(doc2data("menu"));
        allMenuObj.value = { [key]: ret };
        if (callback) {
          callback();
        }
      } else {
        allMenuObj.value[key] = [];
      }
    });
  };

  const menuObj = computed(() => {
    if (isInMo.value) {
      return array2obj(Object.values(menuCache.value).flat());
    }
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


