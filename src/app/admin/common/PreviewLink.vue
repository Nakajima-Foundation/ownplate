<template>
  <div class="shrink-0">
    <router-link :to="link">
      <div
        class="inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
      >
        <i class="material-icons text-op-teal mr-2 text-lg">launch</i>
        <span class="text-op-teal text-sm font-bold">{{
          $t("admin.viewPage")
        }}</span>
      </div>
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { previewLink } from "@/utils/utils";

import { RestaurantInfoData } from "@/models/RestaurantInfo";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
  },
  setup(props) {
    const link = previewLink({ shopInfo: props.shopInfo });
    return {
      link,
    };
  },
});
</script>
