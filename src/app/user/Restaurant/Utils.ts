import {
  ref,
  onUnmounted,
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
