<template>
  <div class="flex-shrink-0">
    <router-link :to="previewLink">
      <div
        class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
      >
        <i class="material-icons text-lg text-op-teal mr-2">launch</i>
        <span class="text-sm font-bold text-op-teal">{{
          $t("admin.viewPage")
        }}</span>
      </div>
    </router-link>
  </div>
</template>

<script>
import { defineComponent, computed } from "@vue/composition-api";
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
    const previewLink = previewLink(props);
    return {
      previewLink,
    };
  },
});
</script>
