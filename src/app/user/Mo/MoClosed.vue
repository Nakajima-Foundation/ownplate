<template>
  <div>
    <div
      class="my-14 mx-6 text-center text-xl font-bold text-black text-opacity-50 sm:mx-auto"
    >
      {{ $t("mobileOrder.closing.closedMessage") }}
    </div>
    <div class="mx-auto h-40 w-40 rounded-full bg-black bg-opacity-5">
      <div>
        <img src="/mo_icon_outage.svg" class="opacity-50" />
      </div>
    </div>
    <div
      class="mx-6 mt-10 max-w-xl text-center font-bold text-black text-opacity-50 sm:mx-auto"
    >
      <div>{{ $t("mobileOrder.closing.closedParagraph") }}</div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { moBaseUrl } from "@/config/project";
export default defineComponent({
  setup() {
    return { moBaseUrl };
  },
});
</script>
