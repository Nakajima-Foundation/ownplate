<template>
  <div>
    <!-- Hero Image -->
    <div>
      <!-- CTA Button -->
      <div class="absolute mx-5 mt-12 sm:mx-10 sm:mt-32 lg:mt-40">
        <div
          class="text-op-90 hidden text-2xl font-bold text-black sm:block lg:text-3xl"
        >
          {{ $t("lp.enjoyOmochilaeri") }}
        </div>
        <div class="text-op-90 w-full text-2xl font-bold text-black sm:hidden">
          <div>{{ $t("lp.enjoy") }}</div>
          <div>{{ $t("lp.omochikaeri") }}</div>
        </div>

        <div class="mt-2 sm:mt-8">
          <router-link to="/r/area/all">
            <div
              class="bg-op-teal hover:bg-op-teal/80 inline-flex h-16 items-center rounded-full px-8 shadow-sm"
            >
              <span class="text-xl font-bold text-white">
                {{ $t("lp.searchRestaurant") }}
              </span>
            </div>
          </router-link>
        </div>
      </div>

      <img
        src="/images/top/user_hero_desktop.jpg"
        class="hidden w-full lg:block"
      />
      <img src="/images/top/user_hero_tablet.jpg" class="w-full lg:hidden" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>
