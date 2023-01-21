<template>
  <o-button
    @click="downloadMenu()"
    :disabled="downloadSubmitting"
    class="b-reset-tw mx-2 mb-2"
  >
    <div
      class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
    >
      <i class="material-icons mr-2 text-lg text-op-teal">menu_book</i>
      <span class="text-sm font-bold text-op-teal">
        {{ $t("button.downloadMenu") }}</span
      >
    </div>
  </o-button>
</template>

<script>
import { defineComponent, ref, computed } from "vue";

import * as pdf from "@/lib/pdf/pdf";
import { usePhoneNumber, shareUrl, useBasePath } from "@/utils/utils";

export default defineComponent({
  props: {
    menuObj: {
      type: Object,
      required: true,
    },
    shopInfo: {
      type: Object,
      required: true,
    },
  },

  setup(props, ctx) {
    const downloadSubmitting = ref(false);
    const shopInfo = computed(() => {
      return props.shopInfo;
    });
    const { nationalPhoneNumber } = usePhoneNumber(shopInfo);

    const downloadMenu = async () => {
      try {
        downloadSubmitting.value = true;
        const basePath = useBasePath();
        const dl = await pdf.menuDownload(
          props.shopInfo,
          props.menuObj,
          nationalPhoneNumber.value,
          shareUrl(ctx.root, basePath.value)
        );
      } catch (e) {
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
