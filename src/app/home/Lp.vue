<template>
  <div>
    <admin-service-introduction />
    <div class="mx-auto max-w-screen-xl">
      <admin-feature />
			<admin-how-to-start />
      <userVoices />
      <!-- <moreButton /> -->
      <!-- <threeSteps /> -->
      <!-- <askButtons /> -->
      <!-- <communityIcons /> -->
      <!-- <mediaLink /> -->
      <operators />
      <aboutService />
      <goToUserLP />
      <!-- <askButtons /> -->
      <!-- <news /> -->
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
import moreButton from "@/components/lp/moreButton.vue";
import threeSteps from "@/components/lp/threeSteps.vue";
import askButtons from "@/components/lp/askButtons.vue";
import communityIcons from "@/components/lp/communityIcons.vue";
import mediaLink from "@/components/lp/mediaLink.vue";
import operators from "@/components/lp/operators.vue";
import aboutService from "@/components/lp/aboutService.vue";
import news from "@/components/lp/news.vue";
import snslink from "@/components/lp/link.vue";

export default defineComponent({
  components: {
    adminServiceIntroduction,
		adminFeature,
		adminHowToStart,
		goToUserLP,
    userVoices,
    moreButton,
    threeSteps,
    askButtons,
    communityIcons,
    mediaLink,
    operators,
    aboutService,
    news,
    snslink,
  },
});
</script>
