<template>
  <div class="mx-6 mt-6 lg:mx-auto lg:max-w-2xl">
    <div class="mt-2 rounded-lg bg-white px-6 py-5 shadow">
      <!-- Title -->
      <div class="mx-0 flex justify-center">
        <img
          :src="moBaseUrl + '/images/assets/campaign_202301_mobile.png'"
          class="sm:hidden"
        />
        <img
          :src="moBaseUrl + '/images/assets/campaign_202301_tablet.png'"
          class="hidden sm:block"
        />
      </div>

      <!-- Lead -->
      <div class="mt-4 text-base font-bold leading-relaxed">
        {{ $t("mobileOrder.campaign.lead") }}
      </div>
      <div class="mt-3 text-xs">
        {{ $t("mobileOrder.campaign.leadNote1") }}
      </div>
      <div class="mt-2 text-xs">
        {{ $t("mobileOrder.campaign.leadNote2") }}
      </div>
      <div class="mt-2 text-xs">
        {{ $t("mobileOrder.campaign.leadNote3") }}
      </div>
      <div class="mt-2 text-xs">
        {{ $t("mobileOrder.campaign.leadNote4") }}
      </div>
    </div>

    <!-- Overview -->
    <div class="mt-6 text-xl font-bold text-black text-opacity-30">
      {{ $t("mobileOrder.campaign.overview") }}
    </div>

    <div class="mt-2 rounded-lg bg-white px-6 py-5 shadow">
      <div class="mb-4">
        <div
          class="-ml-2 inline-block rounded bg-blue-50 py-1 px-2 text-sm font-bold"
        >
          {{ $t("mobileOrder.campaign.receiving") }}
        </div>
        <div class="mt-2 text-sm font-bold">
          {{ $t("mobileOrder.campaign.receivingPeriod") }}
        </div>
      </div>

      <div class="mb-4 items-center">
        <div
          class="-ml-2 inline-block rounded bg-blue-50 px-2 py-1 text-sm font-bold"
        >
          {{ $t("mobileOrder.campaign.using") }}
        </div>
        <div class="mt-2 text-sm font-bold">
          {{ $t("mobileOrder.campaign.usingPeriod") }}
        </div>
      </div>

      <div class="mt-3">
        <div
          class="-ml-2 inline-block rounded bg-blue-50 px-2 py-1 text-sm font-bold"
        >
          {{ $t("mobileOrder.campaign.about") }}
        </div>
        <div class="mt-2 text-base leading-relaxed">
          {{ $t("mobileOrder.campaign.description") }}
        </div>
        <div class="mt-3 text-xs">
          {{ $t("mobileOrder.campaign.descriptionNote1") }}
        </div>
        <div class="mt-2 text-xs">
          {{ $t("mobileOrder.campaign.descriptionNote2") }}
        </div>
        <div class="mt-2 text-xs">
          {{ $t("mobileOrder.campaign.descriptionNote3") }}
        </div>
      </div>
    </div>

    <!-- Notes -->
    <div class="mt-6 text-base font-bold text-black text-opacity-30">
      {{ $t("mobileOrder.campaign.notes") }}
    </div>

    <div class="mt-2 rounded-lg bg-white px-6 py-4 shadow">
      <ul class="ml-3 list-outside list-disc text-sm">
        <li>{{ $t("mobileOrder.campaign.note1") }}</li>
        <li class="mt-2">{{ $t("mobileOrder.campaign.note2") }}</li>
        <li class="mt-2">{{ $t("mobileOrder.campaign.note3") }}</li>
        <li class="mt-2">{{ $t("mobileOrder.campaign.note4") }}</li>
        <li class="mt-2">{{ $t("mobileOrder.campaign.note5") }}</li>
        <li class="mt-2">{{ $t("mobileOrder.campaign.note6") }}</li>
        <li class="mt-2">{{ $t("mobileOrder.campaign.note7") }}</li>
        <li class="mt-2">{{ $t("mobileOrder.campaign.note8") }}</li>
        <li class="mt-2">{{ $t("mobileOrder.campaign.note9") }}</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { moBaseUrl } from "@/config/project";

export default defineComponent({
  setup() {
    onMounted(() => {
      window.scrollTo(0, 0);
    });
    return {
      moBaseUrl,
    };
  },
});
</script>
