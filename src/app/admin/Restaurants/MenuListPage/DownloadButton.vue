<template>
  <button
    @click="downloadMenu()"
    :disabled="downloadSubmitting"
    class="mx-2 mb-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
  >
    <div
      class="inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
    >
      <i class="material-icons text-op-teal mr-2 text-lg">menu_book</i>
      <span class="text-op-teal text-sm font-bold">
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
