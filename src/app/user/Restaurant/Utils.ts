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

  const categoryData = ref<DocumentData[]>([]);
  const loadCategory = () => {
    detacheCategory();
    categoryDetacher.value = onSnapshot(
      query(
        collection(db, `groups/${moPrefix}/category`),
        where("publicFlag", "==", true),
        orderBy("sortKey", "asc")
      ),
      (category) => {
        if (category.empty) {
          console.log("Empty");
          return;
        }
        categoryData.value = category.docs
          .map((doc) => {
            return [doc2data("category")(doc)];
          })
          .flat();
      },
      (error) => {
        console.log("load category error");
      }
    );
  };
  const categoryDataObj = computed(() => {
    return categoryData.value.reduce((tmp, current) => {
      tmp[current.id] = current;
      return tmp;
    }, {});
  });
  return {
    loadCategory,
    categoryData,
    categoryDataObj,
  };
};

export const useSubcategory = (moPrefix: string, category: Ref<string>) => {
  const subCategoryDetacher = ref();
  const detacheSubCategory = () => {
    if (subCategoryDetacher.value) {
      subCategoryDetacher.value();
    }
  };

  onUnmounted(() => {
    detacheSubCategory();
  });
  const subCategoryData = ref<DocumentData[]>([]);
  const loadSubcategory = () => {
    detacheSubCategory();
    subCategoryData.value = [];
    subCategoryDetacher.value = onSnapshot(
      query(
        collection(
          db,
          `groups/${moPrefix}/category/${category.value}/subCategory`
        ),
        where("publicFlag", "==", true),
        orderBy("sortKey", "asc")
      ),
      (category) => {
        if (category.empty) {
          console.log("empty");
          return;
        }
        subCategoryData.value = category.docs.map(doc2data("subCategory"));
      },
      (error) => {
        console.log("load subCategory error");
      }
    );
  };
  return {
    subCategoryData,
    loadSubcategory,
  };
};

export const useAllSubcategory = (moPrefix: string) => {
  const subCategoryDetacher = ref();
  const detacheSubCategory = () => {
    if (subCategoryDetacher.value) {
      subCategoryDetacher.value();
    }
  };

  onUnmounted(() => {
    detacheSubCategory();
  });
  const allSubCategoryData = ref<DocumentData[]>([]);
  const loadAllSubcategory = () => {
    detacheSubCategory();
    subCategoryDetacher.value = onSnapshot(
      query(
        collectionGroup(db, `subCategory`),
        where("groupId", "==", moPrefix),
        orderBy("sortKey", "asc")
      ),
      (category) => {
        if (category.empty) {
          console.log("empty");
          return;
        }
        allSubCategoryData.value = category.docs.map(doc2data("subCategory"));
      },
      (error) => {
        console.log("load subCategory error");
      }
    );
  };
  const allSubCategoryDataObj = computed(() => {
    return allSubCategoryData.value.reduce((tmp, current) => {
      tmp[current.id] = current;
      return tmp;
    }, {});
  });
  return {
    allSubCategoryData,
    allSubCategoryDataObj,
    loadAllSubcategory,
  };
};

export const useMenu = (
  restaurantId: Ref<string>,
  isInMo: ComputedRef<boolean | null>,
  category: Ref<string>,
  subCategory: Ref<string>,
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

export const useCategoryParams = (isInMo: boolean) => {
  const route = useRoute();

  const category = computed(() => {
    return route.params.category as string;
  });
  const subCategory = computed(() => {
    return route.params.subCategory as string;
  });
  const watchCat = computed(() => {
    return [category.value, subCategory.value];
  });
  const hasCategory = computed(() => {
    return category.value && subCategory.value;
  });
  const showCategory = computed(() => {
    return isInMo && !subCategory.value;
  });
  const showSubCategory = computed(() => {
    return isInMo && subCategory.value;
  });

  return {
    category,
    subCategory,
    watchCat,
    hasCategory,
    showCategory,
    showSubCategory,
  };
};

