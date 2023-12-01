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

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useTopPath, regionalSetting, useRestaurantId } from "@/utils/utils";

export default defineComponent({
  emits: ["handleOpen"],
  setup(_, ctx) {
    const specialLogo: any = {
      "5OInKqrhlpe7LHYNYXuU": {
        class: "h-8",
        image: "TBP_logo.jpg",
      },
    };

    const topPath = useTopPath();

    const restaurantId = useRestaurantId();

    const logoClass = computed(() => {
      if (restaurantId.value && specialLogo[restaurantId.value]) {
        return specialLogo[restaurantId.value].class;
      }
      return "h-6";
    });
    const logo = computed(() => {
      if (restaurantId.value && specialLogo[restaurantId.value]) {
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
