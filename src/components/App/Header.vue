<template>
  <div class="flex h-12 items-center bg-white">
    <div class="w-12">
      <a
        @click="handleOpen()"
        class="inline-flex h-12 w-12 items-center justify-center"
      >
        <i class="material-icons text-2xl text-black opacity-50">menu</i>
      </a>
    </div>
    <div class="flex-1 text-center">
      <router-link :to="topPath">
        <img
          :class="logoClass"
          class="m-auto"
          :src="`${logo}`"
          v-if="logo !== null"
        />
      </router-link>
    </div>
    <div class="w-12"></div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from "@vue/composition-api";
import {
  useTopPath,
  regionalSetting,
  useRestaurantId,
  useIsInMo,
} from "@/utils/utils";
import { moBaseUrl } from "@/config/project";

export default defineComponent({
  emits: ["handleOpen"],
  setup(_, ctx) {
    const specialLogo = {
      "5OInKqrhlpe7LHYNYXuU": {
        class: "h-8",
        image: "TBP_logo.jpg",
      },
    };

    const isInMo = useIsInMo(ctx.root);

    const topPath = useTopPath(ctx.root);

    const restaurantId = useRestaurantId(ctx.root);

    const logoClass = computed(() => {
      if (restaurantId.value && specialLogo[restaurantId.value]) {
        return specialLogo[restaurantId.value].class;
      }
      return "h-6";
    });
    const logo = computed(() => {
      if (isInMo.value === null) {
        return null;
      } else if (isInMo.value) {
        return moBaseUrl + "/images/assets/logo_vertical.png";
      } else if (restaurantId.value && specialLogo[restaurantId.value]) {
        return "/" + specialLogo[restaurantId.value].image;
      } else {
        return "/" + regionalSetting.Logo;
      }
    });

    const handleOpen = () => {
      ctx.emit("handleOpen");
    };
    return {
      topPath,
      logo,
      logoClass,
      handleOpen,
    };
  },
});
</script>
