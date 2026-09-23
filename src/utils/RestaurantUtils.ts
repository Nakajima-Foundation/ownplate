import { ref } from "vue";

import type { DocumentData } from "firebase/firestore";

import { RestaurantInfoData } from "@/models/RestaurantInfo";

// 受け取るのは Firestore の snapshot だが、使うのは id と data() だけ。型をその2つに
// 狭めてあるので、試験から最小の値で呼べる。Firestore の QueryDocumentSnapshot は
// この形を構造的に満たすため、呼び出し側は変わらない。
export const restaurant2AreaObj = (
  restaurants: { id: string; data: () => DocumentData }[],
) => {
  return restaurants.reduce<{ [key: string]: RestaurantInfoData[] }>(
    (tmp, doc) => {
      const data = doc.data() as RestaurantInfoData;
      data.id = doc.id;
      if (!tmp[data.state]) {
        tmp[data.state] = [];
      }
      tmp[data.state].push(data);
      return tmp;
    },
    {},
  );
};

export const sortRestaurantObj = (restaurantsObj: {
  [key: string]: RestaurantInfoData[];
}) => {
  return Object.keys(restaurantsObj).forEach((key) => {
    restaurantsObj[key].sort((a: RestaurantInfoData, b: RestaurantInfoData) => {
      return a.restaurantName > b.restaurantName ? 1 : -1;
    });
  });
};
export const imageUtils = () => {
  const imagePopup = ref(false);
  const openImage = () => {
    imagePopup.value = true;
  };
  const closeImage = () => {
    imagePopup.value = false;
  };
  const categoryPopup = ref(false);
  const openCategory = () => {
    categoryPopup.value = true;
  };
  const closeCategory = () => {
    categoryPopup.value = false;
  };
  return {
    imagePopup,
    openImage,
    closeImage,
    categoryPopup,
    openCategory,
    closeCategory,
  };
};
