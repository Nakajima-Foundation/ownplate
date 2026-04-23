import { ref } from "vue";

import { QueryDocumentSnapshot } from "firebase/firestore";

import { RestaurantInfoData } from "@/models/RestaurantInfo";

export const restaurant2AreaObj = (restaurants: QueryDocumentSnapshot[]) => {
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
