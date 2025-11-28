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

      <div class="mt-8 sm:mt-0 sm:ml-8 md:ml-16">
        <router-link to="/r/area/all">
          <div
            class="inline-flex h-16 items-center rounded-full bg-white px-12 shadow-sm hover:bg-white/90 sm:px-16"
          >
            <span class="text-op-teal text-xl font-bold">
              {{ $t("lp.searchRestaurant") }}
            </span>
          </div>
        </router-link>

        <div class="mt-4">
          <div class="inline-flex items-center space-x-4">
            <router-link
              to="/r/area/12"
              class="bg-ownplate-yellow hover:bg-ownplate-yellow/80 inline-flex h-16 items-center rounded-full px-10 sm:px-12"
            >
              <span class="text-op-90 text-xl font-bold text-black">{{
                $t("lp.tokyo")
              }}</span>
            </router-link>
            <router-link
              to="/r/area/26"
              class="bg-ownplate-yellow hover:bg-ownplate-yellow/80 inline-flex h-16 items-center rounded-full px-10 sm:px-12"
            >
              <span class="text-op-90 text-xl font-bold text-black">{{
                $t("lp.osaka")
              }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>
