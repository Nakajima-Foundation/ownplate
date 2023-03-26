<template>
  <div class="mx-6 lg:mx-0">
    <router-link :to="pageBase + '/page/202303spring'">
      <div class="mt-2 mb-4 w-full rounded-lg bg-red-100">
        <img
          :src="moBaseUrl + '/images/assets/setcampaign-banner_mobile.png'"
          class="rounded-lg object-cover sm:hidden"
          id="springBanner"
        />
        <img
          :src="moBaseUrl + '/images/assets/setcampaign-banner_tablet.png'"
          class="hidden rounded-lg object-cover sm:block"
          id="springBanner"
        />
      </div>
    </router-link>
  </div>
</template>

<script>
import {
  defineComponent,
} from "vue";
import { moBaseUrl } from "@/config/project";
export default defineComponent({
  props: {
    pageBase: {
      type: String,
      required: false,
    },
  },
  setup() {
    return {
      moBaseUrl,
    };
  },
});
</script>
