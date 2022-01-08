import { computed } from "vue";
import { useRoute } from "vue-router";


export const useRestaurantId = () => {
  const route = useRoute();
  const restaurantId = computed(() => {
    return route.params.restaurantId;
  });
  return restaurantId;
};

export const useShareUrl = () => {
  const route = useRoute();
  const shareUrl = computed(() => {
    return location.protocol + "//" + location.host + "/r/" + route.params.restaurantId;
  });
  return shareUrl;
};

export const sleep = async (seconds) => {
  return await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};
