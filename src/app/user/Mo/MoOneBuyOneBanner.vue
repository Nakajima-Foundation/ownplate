<template>
  <div class="mx-6 lg:mx-0">
    <router-link :to="pageBase + ''">
      <div class="mt-2 mb-4 w-full rounded-lg bg-white">
        <img
          :src="moBaseUrl + '/images/assets/202306/202306_banner_mobile.png'"
          class="rounded-lg object-cover sm:hidden"
          id=""
        />
        <img
          :src="moBaseUrl + '/images/assets/202306/202306_banner_tablet.png'"
          class="hidden rounded-lg object-cover sm:block"
          id=""
        />
      </div>
    </router-link>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";
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
