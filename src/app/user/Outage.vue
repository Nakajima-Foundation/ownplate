<template>
  <div>
    <div
      class="my-14 mx-6 text-center text-xl font-bold text-black text-opacity-50 sm:mx-auto"
    >
      {{ $t("errorPage.notFound.moMessageTop") }}
    </div>
    <div class="mx-auto h-40 w-40 rounded-full bg-black bg-opacity-5">
      <div>
        <img
          :src="moBaseUrl + '/images/outage/mo_icon_outage.svg'"
          class="opacity-50"
        />
      </div>
    </div>
    <div
      class="mx-6 mt-8 space-y-1 text-center font-bold text-black text-opacity-50 sm:mx-auto"
    >
      <div>{{ $t("errorPage.notFound.moMessage1") }}</div>
      <div>{{ $t("errorPage.notFound.moMessage2") }}</div>
      <div>{{ $t("errorPage.notFound.moMessage3") }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { moBaseUrl } from "@/config/project";
export default defineComponent({
  setup() {
    return { moBaseUrl };
  },
});
</script>
