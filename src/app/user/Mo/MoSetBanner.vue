<template>
  <div>
    <router-link :to="pageBase + '/page/202303spring'">
      <div class="mt-2 mb-4 w-full rounded-lg bg-red-100">
        <img
          src="https://mo-data-dev.omochikaeri.com/images/assets/setcampaign-banner_mobile.png"
          class="object-cover sm:hidden"
          id="springBanner"
        />
        <img
          src="https://mo-data-dev.omochikaeri.com/images/assets/setcampaign-banner_tablet.png"
          class="hidden object-cover sm:block"
          id="springBanner"
        />
      </div>
    </router-link>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";
export default defineComponent({
  props: {
    pageBase: {
      type: String,
      required: false,
    },
  },
});
</script>
