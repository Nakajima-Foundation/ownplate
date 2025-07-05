<template>
  <div>
    <user-hero-image />
    <div class="mx-auto max-w-(--breakpoint-xl)">
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
import { useHead } from "@unhead/vue";

export default defineComponent({
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
    })();

    useHead({
      title: [defaultTitle, "Top"].join(" / "),
    });

    return {};
  },
});
</script>
