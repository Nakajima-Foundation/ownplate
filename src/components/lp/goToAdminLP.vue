<template>
  <div class="pt-10 px-6">
    <div
      class="bg-white rounded-lg px-5 sm:py-6 pb-12 pt-6 px-auto sm:flex items-center justify-center text-center"
    >
      <div>
        <img
          class="object-cover w-40 sm:w-56"
          src="/images/top/restaurant_icon.png"
        />
      </div>

      <div class="mt-8 sm:mt-0 md:ml-16 sm:ml-8">
        <div class="text-xl font-bold text-black opacity-90">
          {{ $t("lp.forOwnerToOpen") }}
        </div>

        <router-link to="/">
          <div
            class="mt-4 inline-flex h-16 items-center rounded-full bg-ownplate-yellow px-5 sm:px-6 shadow-sm hover:bg-opacity-80"
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
