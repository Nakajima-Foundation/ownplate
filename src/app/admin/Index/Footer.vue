<template>
  <div>
    <div class="text-center">
      <!-- User Manuals -->
      <div class="inline-block px-1 pb-2" v-if="isJapan">
        <a
          href="https://docs.omochikaeri.com/manuals/manual.pdf"
          target="_blank"
        >
          <div
            class="inline-flex justify-center items-center rounded-full h-9 bg-white bg-opacity-80 px-4"
          >
            <i class="material-icons text-lg text-op-teal mr-2">help_outline</i>
            <span class="text-sm font-bold text-op-teal">{{
              $t("admin.userManual")
            }}</span>
          </div>
        </a>
      </div>

      <div class="inline-block px-1 pb-2" v-if="isJapan">
        <a href="https://docs.omochikaeri.com/manuals/tips.pdf" target="_blank">
          <div
            class="inline-flex justify-center items-center rounded-full h-9 bg-white bg-opacity-80 px-4"
          >
            <i class="material-icons text-lg text-op-teal mr-2">help_outline</i>
            <span class="text-sm font-bold text-op-teal">{{
              $t("menu.tipsLink")
            }}</span>
          </div>
        </a>
      </div>

      <!-- Support -->
      <div class="inline-block px-1 pb-2" v-if="isJapan">
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfGR4kk65ynfkCRGJsvJz01HZf7AU1nGLL9Rn9i4G9-qiW6MQ/viewform"
          target="_blank"
        >
          <div
            class="inline-flex justify-center items-center rounded-full h-9 bg-white bg-opacity-80 px-4"
          >
            <i class="material-icons text-lg text-op-teal mr-2">mail_outline</i>
            <span class="text-sm font-bold text-op-teal">{{
              $t("admin.suportPage")
            }}</span>
          </div>
        </a>
      </div>
    </div>
    <div
      class="text-center inline-flex justify-center items-center w-full m-auto"
    >
      <!-- Facebook User Group -->
      <div class="inline-block px-1 pb-2" v-if="isJapan">
        <a
          href="https://www.facebook.com/groups/278028420106364/"
          target="_blank"
        >
          <div
            class="inline-flex justify-center items-center rounded-full h-9 bg-white bg-opacity-80 px-4"
          >
            <i class="fab fa-facebook text-lg text-op-teal mr-2"></i>
            <span class="text-sm font-bold text-op-teal">{{
              $t("admin.facebookUserGroup")
            }}</span>
          </div>
        </a>
      </div>

      <!-- Twitter -->
      <div class="inline-block px-1 pb-2" v-if="isJapan">
        <a href="https://twitter.com/omochikaericom" target="_blank">
          <div
            class="inline-flex justify-center items-center rounded-full h-9 bg-white bg-opacity-80 px-4"
          >
            <i class="fab fa-twitter text-lg text-op-teal mr-2"></i>
            <span class="text-sm font-bold text-op-teal"> Twitte </span>
          </div>
        </a>
      </div>

      <!-- Note -->
      <div class="inline-block px-1 pb-2" v-if="isJapan">
        <a href="https://note.com/singsoc/m/m19dd935e84e4" target="_blank">
          <div
            class="inline-flex justify-center items-center rounded-full h-9 bg-white bg-opacity-80 px-4"
          >
            <i class="material-icons text-lg text-op-teal mr-2">mail_outline</i>
            <span class="text-sm font-bold text-op-teal"> Note </span>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>
