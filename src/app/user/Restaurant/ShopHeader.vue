<template>
  <div>
    <!-- Restaurant Profile Photo -->
    <div class="text-center">
      <div class="inline-block w-16 h-16 rounded-full bg-black bg-opacity-50">
        <img :src="profileImage" class="w-16 h-16 rounded-full object-cover" />
      </div>
    </div>

    <!-- Restaurant Name -->
    <div class="mt-2 text-center text-xl font-bold">
      {{ shopInfo.restaurantName }}
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from "@vue/composition-api";

import { resizedProfileImage } from "@/utils/utils";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
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
