import { ref, onUnmounted, computed, Ref } from "@vue/composition-api";

import { db } from "@/lib/firebase/firebase9";
import {
  query,
  onSnapshot,
  getDocs,
  collection,
  where,
  limit,
  startAfter,
  orderBy,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";

import { doc2data, array2obj } from "@/utils/utils";

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
        // categoryData.value = category.docs.map(doc2data("category"))
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

  return {
    loadCategory,
    categoryData,
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

export const useMenu = (
  restaurantId: Ref<string>,
  isInMo: Ref<string>,
  category: Ref<string>,
  subCategory: Ref<string>,
  groupData: any
) => {
  const allMenuObj = ref<{ [key: string]: DocumentData[] }>({});
  const menuCache = ref<{ [key: string]: any }>({});
  const menuDetacher = ref();
  const loading: { [key: string]: boolean } = {};

  const allMenuObjKey = computed(() => {
    if (isInMo.value) {
      return subCategory.value;
    }
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
    if (isInMo.value && groupData?.restaurantId) {
      return `restaurants/${groupData.restaurantId}/menus`;
    }
    return `restaurants/${restaurantId.value}/menus`;
  });
  const setCache = (cache: any) => {
    menuCache.value = cache;
  };
  const loadMenu = async () => {
    detacheMenu();
    if (isInMo.value && !category.value && !subCategory.value) {
      return;
    }
    const hasSubCategory = category.value && subCategory.value;
    const cacheKey = hasSubCategory
      ? [category.value, subCategory.value].join("_")
      : "";
    if (menuCache.value[cacheKey]) {
      allMenuObj.value[allMenuObjKey.value] = menuCache.value[cacheKey];
      return;
    }

    if (hasSubCategory) {
      allMenuObj.value[subCategory.value] = [];
      const cacheBase: DocumentData[] = [];

      if (loading[cacheKey]) {
        return;
      }
      loading[cacheKey] = true;

      const limitVal = 20;
      const loop = async (
        category: string,
        subCategory: string,
        last: null | QueryDocumentSnapshot<DocumentData>
      ) => {
        // console.log("loop: ", subCategory);
        const tmpQuery = query(
          collection(db, menuPath.value),
          where("deletedFlag", "==", false),
          where("publicFlag", "==", true),
          where("category", "==", category),
          where("subCategory", "==", subCategory),
          orderBy("createdAt"),
          limit(limitVal)
        );
        const menuQuery = last ? query(tmpQuery, startAfter(last)) : tmpQuery;

        const menu = await getDocs(query(menuQuery));
        if (!menu.empty) {
          menu.docs
            .filter((a) => {
              const data = a.data();
              return data.validatedFlag === undefined || data.validatedFlag;
            })
            .map((a) => {
              const m = doc2data("menu")(a);
              cacheBase.push(m);
              return m;
            });
          const newVal = { ...allMenuObj.value };
          newVal[subCategory] = cacheBase;
          allMenuObj.value = newVal;
          menuCache.value[cacheKey] = cacheBase;
        }
        return menu.docs.length == limitVal ? menu.docs[limitVal - 1] : null;
      };

      const doLoop = async (category: string, subCategory: string) => {
        let last: null | QueryDocumentSnapshot<DocumentData> = null;
        do {
          last = await loop(category, subCategory, last);
        } while (last);
      };
      doLoop(category.value, subCategory.value);
    } else {
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
          allMenuObj.value = { [allMenuObjKey.value]: ret };
        } else {
          allMenuObj.value[allMenuObjKey.value] = [];
        }
      });
    }
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

export const useCategoryParams = (ctx: any) => {
  const category = computed(() => {
    return ctx.root.$route.params.category;
  });
  const subCategory = computed(() => {
    return ctx.root.$route.params.subCategory;
  });
  const watchCat = computed(() => {
    return [category.value, subCategory.value];
  });
  const hasCategory = computed(() => {
    return category.value && subCategory.value;
  });
  return {
    category,
    subCategory,
    watchCat,
    hasCategory,
  };
};
