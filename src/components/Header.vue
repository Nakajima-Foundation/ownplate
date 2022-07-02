<template>
  <div class="flex items-center h-12 bg-white">
    <div class="w-12">
      <a
        @click="handleOpen()"
        class="w-12 h-12 inline-flex justify-center items-center"
        >
        <i class="material-icons text-black opacity-50 text-2xl">menu</i>
      </a>
    </div>
    <div class="flex-1 text-center">
      <router-link :to="topPath">
        <img :class="this.logoClass" class="m-auto" :src="`/${this.logo}`" />
      </router-link>
    </div>
    <div class="w-12"></div>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  computed,
} from "@vue/composition-api";
import { useTopPath, regionalSetting, useRestaurantId } from "@/utils/utils";

export default defineComponent({
  emits: ["handleOpen"],
  setup(_, ctx) {
    const specialLogo = {
      "5OInKqrhlpe7LHYNYXuU": {
        class: "h-8",
        image: "kuuya-logo.jpg",
      },
    };

    const topPath = useTopPath(ctx.root);
    
    const restaurantId = useRestaurantId(ctx.root);

    const logoClass = computed(() => {
      if (restaurantId.value && specialLogo[restaurantId.value]) {
        return specialLogo[restaurantId.value].class;
      }
      return "h-6";
    });
    const logo = computed(() => {
      if (restaurantId.value && specialLogo[restaurantId.value]) {
        return specialLogo[restaurantId.value].image;
      } else {
        return regionalSetting.Logo;
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
  }
});
</script>
