<template>
  <div class="flex-shrink-0">
    <router-link :to="link">
      <div
        class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
      >
        <i class="material-icons mr-2 text-lg text-op-teal">launch</i>
        <span class="text-sm font-bold text-op-teal">{{
          $t("admin.viewPage")
        }}</span>
      </div>
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { previewLink } from "@/utils/utils";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    isInMo: {
      type: Boolean,
      required: true,
    },
    moPrefix: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const link = previewLink(props);
    return {
      link,
    };
  },
});
</script>
