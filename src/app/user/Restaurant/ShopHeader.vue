<template>
  <div>
    <!-- Restaurant Profile Photo -->
    <div class="text-center">
      <div class="inline-block h-16 w-16 rounded-full bg-black/50">
        <img :src="profileImage" class="h-16 w-16 rounded-full object-cover" />
      </div>
    </div>

    <!-- Restaurant Name -->
    <div class="mt-2 text-center text-xl font-bold">
      {{ shopInfo.restaurantName }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "vue";

import { resizedProfileImage } from "@/utils/utils";
import { RestaurantInfoData } from "@/models/RestaurantInfo";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
  },
  setup(props) {
    const profileImage = computed(() => {
      return resizedProfileImage(props.shopInfo, "600");
    });
    return {
      profileImage,
    };
  },
});
</script>
