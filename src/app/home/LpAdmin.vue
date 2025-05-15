<template>
  <div>
    <ownplate-service-image />
    <div class="mx-auto max-w-(--breakpoint-xl)">
      <entrance-buttons />
      <demo />
      <userVoices />
      <!-- <moreButton /> -->
      <!-- <threeSteps /> -->
      <!-- <askButtons /> -->
      <!-- <communityIcons /> -->
      <!-- <mediaLink /> -->
      <operators />
      <aboutService />
      <entrance-buttons />
      <!-- <askButtons /> -->
      <!-- <news /> -->
      <news />
    </div>
    <snslink />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import ownplateServiceImage from "@/components/lp/ownplateServiceImage.vue";
import entranceButtons from "@/components/lp/entranceButtons.vue";
import userVoices from "@/components/lp/userVoices.vue";
import demo from "@/components/lp/demo.vue";
// import moreButton from "@/components/lp/moreButton.vue";
// import threeSteps from "@/components/lp/threeSteps.vue";
// import askButtons from "@/components/lp/askButtons.vue";
// import communityIcons from "@/components/lp/communityIcons.vue";
// import mediaLink from "@/components/lp/mediaLink.vue";
import operators from "@/components/lp/operators.vue";
import aboutService from "@/components/lp/aboutService.vue";
import news from "@/components/lp/news.vue";
import snslink from "@/components/lp/link.vue";

export default defineComponent({
  components: {
    ownplateServiceImage,
    entranceButtons,
    userVoices,
    demo,
    //     moreButton,
    //     threeSteps,
    //     askButtons,
    //     communityIcons,
    //     mediaLink,
    operators,
    aboutService,
    news,
    snslink,
  },
});
</script>
