<template>
  <!--Campaign 202301-->
  <div>
    <div
      class="mx-6 rounded-lg bg-white p-6 text-center sm:max-w-7xl xl:mx-auto"
      >
      <div class="mx-0 flex justify-center sm:max-w-4xl md:mx-auto">
        <img
          :src="moBaseUrl + '/images/assets/campaign_202301_mobile.png'"
          class="sm:hidden"
          />
        <img
            :src="moBaseUrl + '/images/assets/campaign_202301_tablet.png'"
          class="hidden sm:block"
          />
      </div>
      
      <div class="mt-5 text-black sm:mt-8">
        {{ $t("mobileOrder.campaign.topDescription1") }}
      </div>
      <div class="mt-2 text-black">
        {{ $t("mobileOrder.campaign.topDescription2") }}
        
        <router-link :to="moBasePath + '/campaign/202301'">
          <span class="font-bold text-op-teal underline">{{
            $t("mobileOrder.campaign.topLink")
            }}</span>
          {{ $t("mobileOrder.campaign.topDescription3") }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "@vue/composition-api";
import { moBaseUrl } from "@/config/project";
export default defineComponent({
  setup() {
    return {
      moBaseUrl,
    }
  }
});
</script>
