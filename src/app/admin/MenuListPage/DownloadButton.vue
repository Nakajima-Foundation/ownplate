<template>
  <o-button
    @click="downloadMenu()"
    :disabled="downloadSubmitting"
    class="b-reset-tw mx-2 mb-2"
  >
    <div
      class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
    >
      <i class="material-icons text-lg text-op-teal mr-2">menu_book</i>
      <span class="text-sm font-bold text-op-teal">
        {{ $t("button.downloadMenu") }}</span
      >
    </div>
  </o-button>
</template>

<script>
import { defineComponent, ref, computed } from "@vue/composition-api";

import * as pdf from "@/lib/pdf/pdf";
import { usePhoneNumber } from "@/utils/phoneutil";
import { shareUrl } from "@/utils/utils";

export default defineComponent({
  props: {
    menuObj: {
      type: Object,
      required: true,
    },
    restaurantInfo: {
      type: Object,
      required: true,
    },
  },

  setup(props, ctx) {
    const downloadSubmitting = ref(false);
    const restaurantInfo = computed(() => {
      return props.restaurantInfo;
    });
    const { nationalPhoneNumber } = usePhoneNumber(restaurantInfo);

    const downloadMenu = async () => {
      downloadSubmitting.value = true;
      const dl = await pdf.menuDownload(
        props.restaurantInfo,
        props.menuObj,
        nationalPhoneNumber.value,
        shareUrl(ctx.root)
      );
      downloadSubmitting.value = false;
    };
    return {
      downloadSubmitting,
      downloadMenu,
    };
  },
});
</script>
