<template>
  <div>
    <ownplate-service-image />
    <div class="max-w-screen-xl mx-auto">
      <div class="mx-6 mt-6 text-center lg:grid lg:grid-cols-3 lg:gap-4">
        <!-- For Food Lovers -->
        <div class="mb-4 lg:mb-0">
          <entrance-buttons-food-lovers />
        </div>
        <div class="bg-white rounded-lg lg:col-span-2">
          <!-- Order History -->
          <div class="pt-6 pb-6">
            <history-button />

            <!-- Favorites -->
            <favorite-button />
          </div>
        </div>
      </div>

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
      <snslink />
    </div>
  </div>
</template>
<script>
import ownplateServiceImage from "@/components/lp/ownplateServiceImage.vue";
import entranceButtons from "@/components/lp/entranceButtons.vue";
import entranceButtonsFoodLovers from "@/components/lp/entranceButtonsFoodLovers.vue";
import userVoices from "@/components/lp/userVoices.vue";
import moreButton from "@/components/lp/moreButton.vue";
import threeSteps from "@/components/lp/threeSteps.vue";
import askButtons from "@/components/lp/askButtons.vue";
import communityIcons from "@/components/lp/communityIcons.vue";
import mediaLink from "@/components/lp/mediaLink.vue";
import operators from "@/components/lp/operators.vue";
import aboutService from "@/components/lp/aboutService.vue";
import news from "@/components/lp/news.vue";
import snslink from "@/components/lp/link.vue";

import HistoryButton from "@/components/users/HistoryButton.vue";
import FavoriteButton from "@/components/users/FavoriteButton.vue";

export default {
  components: {
    ownplateServiceImage,
    entranceButtons,
    entranceButtonsFoodLovers,
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
    HistoryButton,
    FavoriteButton,
  },
};
</script>
