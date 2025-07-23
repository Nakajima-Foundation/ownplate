<template>
  <button
    @click="downloadMenu()"
    :disabled="downloadSubmitting"
    class="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mx-2 mb-2"
  >
    <div
      class="inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
    >
      <i class="material-icons mr-2 text-lg text-op-teal">menu_book</i>
      <span class="text-sm font-bold text-op-teal">
        {{ $t("button.downloadMenu") }}</span
      >
    </div>
  </button>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from "vue";

import * as pdf from "@/lib/pdf/pdf";
import { usePhoneNumber, shareUrl, useBasePath } from "@/utils/utils";

import { RestaurantInfoData } from "@/models/RestaurantInfo";

export default defineComponent({
  props: {
    menuObj: {
      type: Object,
      required: true,
    },
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
  },

  setup(props) {
    const downloadSubmitting = ref(false);
    const shopInfo = computed(() => {
      return props.shopInfo;
    });
    const { nationalPhoneNumber } = usePhoneNumber(shopInfo);

    const basePath = useBasePath();
    const url = shareUrl(basePath.value);
    const downloadMenu = async () => {
      try {
        downloadSubmitting.value = true;
        await pdf.menuDownload(
          props.shopInfo,
          props.menuObj,
          nationalPhoneNumber.value,
          url,
        );
      } catch (__e) {
        alert("sorry error. ask omochikaeri administrator.");
      } finally {
        downloadSubmitting.value = false;
      }
    };
    return {
      downloadSubmitting,
      downloadMenu,
    };
  },
});
</script>
