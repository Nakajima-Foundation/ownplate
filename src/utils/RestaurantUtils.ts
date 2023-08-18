import { ref } from "vue";

import { DocumentData } from "firebase/firestore";

import { RestaurantInfoData } from "@/models/RestaurantInfo";

export const restaurant2AreaObj = (restaurants: DocumentData[]) => {
  return restaurants.reduce(
    (tmp: { [key: string]: RestaurantInfoData[] }, doc) => {
      const data = doc.data();
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
  return Object.keys(restaurantsObj).map((key) => {
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
