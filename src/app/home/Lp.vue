<template>
  <div>
    <admin-service-introduction :isAdmin="isAdmin" />
    <div class="mx-auto max-w-screen-xl">
      <admin-feature />
      <admin-how-to-start />
      <userVoices />
      <operators />
      <aboutService />
      <goToUserLP />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import adminServiceIntroduction from "@/components/lp/adminServiceIntroduction.vue";
import adminFeature from "@/components/lp/adminFeature.vue";
import adminHowToStart from "@/components/lp/adminHowToStart.vue";
import userVoices from "@/components/lp/userVoices.vue";
import goToUserLP from "@/components/lp/goToUserLP.vue";
import operators from "@/components/lp/operators.vue";
import aboutService from "@/components/lp/aboutService.vue";

import { defaultTitle, sleep } from "@/utils/utils";
import { useHead } from "@unhead/vue";

export default defineComponent({
  components: {
    adminServiceIntroduction,
    adminFeature,
    adminHowToStart,
    goToUserLP,
    userVoices,
    operators,
    aboutService,
  },
  props: {
    isAdmin: {
      type: Boolean,
      require: true,
      default: false,
    },
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
