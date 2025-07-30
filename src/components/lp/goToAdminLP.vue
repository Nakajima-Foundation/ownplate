<template>
  <div class="px-6 pt-10">
    <div
      class="px-auto items-center justify-center rounded-lg bg-white px-5 pt-6 pb-12 text-center sm:flex sm:py-6"
    >
      <div>
        <img
          class="w-40 object-cover sm:w-56"
          src="/images/top/restaurant_icon.png"
        />
      </div>

      <div class="mt-8 sm:mt-0 sm:ml-8 md:ml-16">
        <div class="text-xl font-bold text-black opacity-90">
          {{ $t("lp.forOwnerToOpen") }}
        </div>

        <router-link to="/">
          <div
            class="bg-ownplate-yellow hover:bg-ownplate-yellow/80 mt-4 inline-flex h-16 items-center rounded-full px-5 shadow-sm sm:px-6"
          >
            <span class="text-xl font-bold text-black opacity-90">
              {{ $t("lp.clickHereToSignup") }}
            </span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>
