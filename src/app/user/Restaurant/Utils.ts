import {
  ref,
  onUnmounted,
  computed,
  Ref,
} from "@vue/composition-api";

import { db } from "@/lib/firebase/firebase9";
import {
  query,
  onSnapshot,
  collection,
  where,
  DocumentData,
} from "firebase/firestore";

import {
  doc2data,
  array2obj,
} from "@/utils/utils";

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


export const useCategory = (moPrefix: string) => {
  const categoryDetacher = ref();
  const detacheCategory = () => {
    if (categoryDetacher.value) {
      categoryDetacher.value();
    }
  };
  onUnmounted(() => {
    detacheCategory();
  });
  
  const categoryData =  ref<DocumentData[]>([]);
  const loadCategory = () => {
    detacheCategory();
    categoryDetacher.value = onSnapshot(
      query(
        collection(db, `groups/${moPrefix}/category`),
      ),
      (category) => {
        if (!category.empty) {
          categoryData.value = category.docs.map(doc2data("category"));
          console.log(categoryData.value);
        }
      },
      (error) => {
        console.log("load category error");
      }
    );
  };
  return {
    loadCategory,
    categoryData
  }
};

export const useMenu = (
  restaurantId: Ref<string>,
  isInMo: Ref<string>,
  category: Ref<string>,
  subCategory: Ref<string>
) => {
  const menus = ref<DocumentData[]>([]);

  const menuDetacher = ref();
  const detacheMenu = () => {
    if (menuDetacher.value) {
      menuDetacher.value();
    }
  };
  const menuPath = computed(() => {
    return `restaurants/${restaurantId.value}/menus`;
  });
  
  const loadMenu = () => {
    // TODO Cache for mo
    detacheMenu();
    if (isInMo.value && !category.value && !subCategory.value) {
      return ;
    }
    const menuQuery =
      category.value && subCategory.value
      ? query(
        collection(db, menuPath.value),
        where("deletedFlag", "==", false),
        where("publicFlag", "==", true),
        where("category", "==", category.value),
        where("subCategory", "==", subCategory.value)
      )
      : query(
        collection(db, menuPath.value),
        where("deletedFlag", "==", false),
        where("publicFlag", "==", true)
      );
    
    menuDetacher.value = onSnapshot(query(menuQuery), (menu) => {
      if (!menu.empty) {
        menus.value = menu.docs
          .filter((a) => {
            const data = a.data();
            return data.validatedFlag === undefined || data.validatedFlag;
          })
          .map(doc2data("menu"));
      }
    });
  };

  const menuObj = computed(() => {
    return array2obj(menus.value);
  });

  return {
    loadMenu,
    menus,
    menuObj,
  };
};

//export const useCategoryParams = () => {
// };
