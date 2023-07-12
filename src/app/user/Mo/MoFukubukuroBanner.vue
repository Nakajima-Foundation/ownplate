<template>
<div>
    <router-link :to="pageBase + '/page/202307'">
      <div class="mt-2 mb-4 w-full rounded-lg bg-white">
        <img
          :src="moBaseUrl + '/images/assets/202307/202307_banner_mobile2.png'"
          class="rounded-lg object-cover sm:hidden"
          id=""
        />
        <img
          :src="moBaseUrl + '/images/assets/202307/202307_banner_tablet2.png'"
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
  },
  setup() {
    return {
      moBaseUrl,
    };
  },
});
</script>
