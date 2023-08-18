<template>
  <div>
    <!-- Hero Image -->
    <div>
      <!-- CTA Button -->
      <div class="mx-5 sm:mx-10 lg:mt-40 sm:mt-32 mt-12 absolute">
        <div
          class="font-bold text-black text-op-90 text-2xl lg:text-3xl hidden sm:block"
        >
          {{ $t("lp.enjoyOmochilaeri") }}
        </div>
        <div class="font-bold text-black text-op-90 text-2xl sm:hidden w-full">
          <div>{{ $t("lp.enjoy") }}</div>
          <div>{{ $t("lp.omochikaeri") }}</div>
        </div>

        <div class="mt-2 sm:mt-8">
          <router-link to="/r/area/all">
            <div
              class="inline-flex h-16 items-center rounded-full bg-op-teal px-8 shadow hover:bg-opacity-80"
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
      <img src="/images/top/user_hero_tablet.jpg" class="lg:hidden w-full" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>
