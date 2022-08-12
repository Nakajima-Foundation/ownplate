import {
  ref,
  computed,
  onUnmounted,
  Ref,
  ComputedRef,
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
import { doc2data, array2obj } from "@/utils/utils";

export const useMenuAndTitle = (
  menuRestaurantId: Ref<string>,
  isInMo: boolean,
  category: ComputedRef<string>,
  subCategory: ComputedRef<string>
) => {
  const menus = ref<DocumentData[] | null>(null);
  const menuCache: { [key: string]: any } = ref({});
  const menuDetacher = ref<Unsubscribe | null>(null);
  const detacheMenu = () => {
    if (menuDetacher.value) {
      menuDetacher.value();
    }
  };

  const titles = ref<DocumentData[] | null>(null);
  const menuObj = ref({});
  const detachers = ref<Unsubscribe[]>([]);
  const setCache = (cache: any) => {
    menuCache.value = cache;
  };

  const loadMenu = () => {
    detacheMenu();
    if (isInMo && !category.value && !subCategory.value) {
      return;
    }

    const cacheKey =
      category.value && subCategory.value
        ? [category.value, subCategory.value].join("_")
        : "";
    if (menuCache.value[cacheKey]) {
      menus.value = menuCache.value[cacheKey];
      return;
    }
    const menuQuery =
      category.value && subCategory.value
        ? query(
            collection(db, `restaurants/${menuRestaurantId.value}/menus`),
            where("deletedFlag", "==", false),
            where("category", "==", category.value),
            where("subCategory", "==", subCategory.value)
          )
        : query(
            collection(db, `restaurants/${menuRestaurantId.value}/menus`),
            where("deletedFlag", "==", false)
          );
    menuDetacher.value = onSnapshot(
      query(menuQuery),
      (results) => {
        menus.value = (results.empty ? [] : results.docs).map(doc2data("menu"));
      },

      (e) => {
        console.log(`restaurants/${menuRestaurantId.value}/menus`);
        console.log(category.value, subCategory.value);
        console.log(e);
      }
    );
  };

  const titleDetacher = onSnapshot(
    query(
      collection(db, `restaurants/${menuRestaurantId.value}/titles`),
      where("deletedFlag", "==", false)
    ),
    (results) => {
      titles.value = (results.empty || isInMo ? [] : results.docs).map(
        doc2data("title")
      );
    }
  );

  const itemsObj = computed(() => {
    if (menus.value && titles.value) {
      menuObj.value = array2obj(menus.value);
      return array2obj(menus.value.concat(titles.value));
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
  };
};
