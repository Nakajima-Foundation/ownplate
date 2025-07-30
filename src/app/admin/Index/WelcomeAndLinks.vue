<template>
  <div class="bg-ownplate-yellow p-4">
    <div class="pb-4 text-center text-2xl font-bold text-white">
      {{ $t("admin.welcomeMessage") }}
    </div>

    <div
      class="m-auto inline-flex w-full items-center justify-center text-center"
    >
      <!-- User Manuals -->
      <div class="inline-block px-1 pb-2" v-if="isJapan">
        <router-link to="/admin/docs/">
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-white/80 px-4"
          >
            <i class="material-icons text-op-teal mr-2 text-lg">help_outline</i>
            <span class="text-op-teal text-sm font-bold">{{
              $t("admin.userManual")
            }}</span>
          </div>
        </router-link>
      </div>

      <!-- Support -->
      <div class="inline-block px-1 pb-2" v-if="isJapan">
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfGR4kk65ynfkCRGJsvJz01HZf7AU1nGLL9Rn9i4G9-qiW6MQ/viewform"
          target="_blank"
        >
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-white/80 px-4"
          >
            <i class="material-icons text-op-teal mr-2 text-lg">mail_outline</i>
            <span class="text-op-teal text-sm font-bold">{{
              $t("admin.suportPage")
            }}</span>
          </div>
        </a>
      </div>

      <!-- Facebook User Group -->
      <div class="inline-block px-1 pb-2" v-if="false">
        <a
          href="https://www.facebook.com/groups/278028420106364/"
          target="_blank"
        >
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-white/80 px-4"
          >
            <i class="fab fa-facebook text-op-teal mr-2 text-lg"></i>
            <span class="text-op-teal text-sm font-bold">{{
              $t("admin.facebookUserGroup")
            }}</span>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { isJapan } from "@/utils/utils";
export default defineComponent({
  setup() {
    return { isJapan };
  },
});
</script>
