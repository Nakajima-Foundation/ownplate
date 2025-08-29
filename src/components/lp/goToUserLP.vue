<template>
  <div class="px-6 pt-10">
    <div
      class="bg-op-teal px-auto items-center justify-center rounded-lg px-5 pt-6 pb-12 text-center sm:flex sm:py-6"
    >
      <div>
        <img
          class="w-40 object-cover sm:w-56"
          src="/images/top/takeout_icon.png"
        />
      </div>

      <div class="mt-4 sm:mt-0">
        <router-link to="/home">
          <div
            class="inline-flex h-16 items-center rounded-full bg-white px-8 shadow-sm hover:bg-white/90 sm:ml-2 md:ml-12"
          >
            <span class="text-op-teal text-xl font-bold">
              {{ $t("lp.clickHereToOrder") }}
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
