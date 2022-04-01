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
import ownplateServiceImage from "~/components/lp/ownplateServiceImage";
import entranceButtons from "~/components/lp/entranceButtons";
import entranceButtonsFoodLovers from "~/components/lp/entranceButtonsFoodLovers";
import userVoices from "~/components/lp/userVoices";
import moreButton from "~/components/lp/moreButton";
import threeSteps from "~/components/lp/threeSteps";
import askButtons from "~/components/lp/askButtons";
import communityIcons from "~/components/lp/communityIcons";
import mediaLink from "~/components/lp/mediaLink";
import operators from "~/components/lp/operators";
import aboutService from "~/components/lp/aboutService";
import news from "~/components/lp/news";
import snslink from "~/components/lp/link";

import HistoryButton from "@/components/users/HistoryButton";
import FavoriteButton from "@/components/users/FavoriteButton";

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

// <!-- Go to Owner Manual -->
// <div class="align-center m-t-16" v-if="isJapan">
// 	<a href="https://gluepass.jp/g/ownplatejp/pg/Zy8VserQdTxFVKLaFcOK" target="_blank">
// 		<div class="op-button-text">
// 			<i class="material-icons">help_outline</i>
// 			<span>{{ $t("menu.adminManual") }}</span>
// 		</div>
// 	</a>
// </div>

// <!-- Go to Owner Support -->
// <div class="align-center" v-if="isJapan">
// 	<a
// 		href="https://docs.google.com/forms/d/e/1FAIpQLSfGR4kk65ynfkCRGJsvJz01HZf7AU1nGLL9Rn9i4G9-qiW6MQ/viewform"
// 		target="_blank"
// 	>
// 		<div class="op-button-text">
// 			<i class="material-icons">mail_outline</i>
// 			<span>{{ $t("menu.adminSupport") }}</span>
// 		</div>
// 	</a>
// </div>

// <!-- Go to Facebook User Group -->
// <div class="align-center" v-if="isJapan">
// 	<a href="https://www.facebook.com/groups/278028420106364/" target="_blank">
// 		<div class="op-button-text">
// 			<i class="fab fa-facebook c-primary m-r-8" style="font-size:18px" />
// 			<span>{{ $t("menu.adminUserGroup") }}</span>
// 		</div>
// 	</a>
// </div>
// <!-- Go to User Manual -->
// <div class="align-center m-t-16">
// 	<a href="https://gluepass.jp/g/ownplatejp/pg/zzDScN7kc1WgNQaA9J7v" target="_blank">
// 		<div class="op-button-text">
// 			<i class="material-icons">help_outline</i>
// 			<span>{{ $t("menu.userManual") }}</span>
// 		</div>
// 	</a>
// </div>

// <!-- Go to User Support -->
// <div class="align-center" v-if="isJapan">
// 	<a
// 		href="https://docs.google.com/forms/d/e/1FAIpQLSfGR4kk65ynfkCRGJsvJz01HZf7AU1nGLL9Rn9i4G9-qiW6MQ/viewform"
// 		target="_blank"
// 	>
// 		<div class="op-button-text">
// 			<i class="material-icons">mail_outline</i>
// 			<span>{{ $t("menu.userSupport") }}</span>
// 		</div>
// 	</a>
// </div>
</script>
