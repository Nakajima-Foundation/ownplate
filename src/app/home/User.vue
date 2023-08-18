<template>
  <div>
    <user-hero-image />
    <div class="mx-auto max-w-screen-xl">
      <search-restaurant />
			<goToAdminLP />
			<operators />
      <aboutService />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import userHeroImage from "@/components/lp/userHeroImage.vue";
import searchRestaurant from "@/components/lp/searchRestaurant.vue";
import goToAdminLP from "@/components/lp/goToAdminLP.vue";
import operators from "@/components/lp/operators.vue";
import aboutService from "@/components/lp/aboutService.vue";

import { defaultTitle, sleep } from "@/utils/utils";

export default defineComponent({
  metaInfo() {
    return {
      title: [defaultTitle, "Top"].join(" / "),
    };
  },
  components: {
    userHeroImage,
		searchRestaurant,
		goToAdminLP,
    operators,
    aboutService,
  },
  setup() {
    (async () => {
      await sleep(0.1);
      window.scrollTo(0, 0);
    })()
    return {
    };
  },
});
</script>
