<template>
  <div>
    <ownplate-service-image />
    <div class="max-w-screen-xl mx-auto">
      <entrance-buttons />
      <userVoices />
      <demo />
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
import userVoices from "~/components/lp/userVoices";
import demo from "~/components/lp/demo";
import moreButton from "~/components/lp/moreButton";
import threeSteps from "~/components/lp/threeSteps";
import askButtons from "~/components/lp/askButtons";
import communityIcons from "~/components/lp/communityIcons";
import mediaLink from "~/components/lp/mediaLink";
import operators from "~/components/lp/operators";
import aboutService from "~/components/lp/aboutService";
import news from "~/components/lp/news";
import snslink from "~/components/lp/link";

export default {
  components: {
    ownplateServiceImage,
    entranceButtons,
    demo,
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
