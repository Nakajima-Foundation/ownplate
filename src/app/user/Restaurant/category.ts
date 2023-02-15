import { defineComponent, computed } from "vue";
import { useBasePath, smallImageErrorHandler, getRestaurantId } from "@/utils/utils";
import { moBaseUrl } from "@/config/project";

export default (name: string) => {
  return defineComponent({
    name,
    props: {
      categoryData: {
        type: Array,
        required: true,
      },
      howtoreceive: {
        type: String,
        required: true,
      },
    },
    setup() {
      const basePath = useBasePath();
      const restaurantId = getRestaurantId();
      
      return {
        basePath,
        moBaseUrl,
        smallImageErrorHandler,
        restaurantId,
      };
    },
  });
};
