<template>
<div class="mx-6 lg:mx-0" v-if="[1,2,3].includes(term)">
    <router-link :to="pageBase + '/page/202306buy' + term">
      <div class="mt-2 mb-4 w-full rounded-lg bg-white">
        <img
          :src="moBaseUrl + '/images/assets/202306/202306_banner_mobile3.png'"
          class="rounded-lg object-cover sm:hidden"
          id=""
        />
        <img
          :src="moBaseUrl + '/images/assets/202306/202306_banner_tablet3.png'"
          class="hidden rounded-lg object-cover sm:block"
          id=""
        />
      </div>
    </router-link>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { moBaseUrl } from "@/config/project";
export default defineComponent({
  props: {
    pageBase: {
      type: String,
      required: true,
    },
    term: {
      type: Number,
      required: true,
    },
  },
  setup() {
    return {
      moBaseUrl,
    };
  },
});
</script>
