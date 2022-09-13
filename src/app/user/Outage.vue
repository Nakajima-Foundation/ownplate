<template>
  <div>
    <div
      class="sm:text-xl font-bold text-center text-black text-opacity-50 my-14 mx-auto"
    >
      {{ $t("errorPage.notFound.moMessageTop") }}
    </div>
    <div class="w-40 h-40 bg-black bg-opacity-5 rounded-full mx-auto">
      <div>
        <img :src="moBaseUrl + '/images/outage/mo_icon_outage.svg'" />
      </div>
    </div>
    <div
      class="font-bold text-center text-black text-opacity-50 mt-8 mx-auto space-y-1"
    >
      <div>{{ $t("errorPage.notFound.moMessage1") }}</div>
      <div>{{ $t("errorPage.notFound.moMessage2") }}</div>
      <div>{{ $t("errorPage.notFound.moMessage3") }}</div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from "@vue/composition-api";
import { moBaseUrl } from "@/config/project";
export default defineComponent({
  setup() {
    return { moBaseUrl };
  },
});
</script>
