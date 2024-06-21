<template>
  <!-- admin feature -->
  <div class="pt-10 px-6">
    <div class="text-black text-center text-op-90 text-2xl font-bold">
      {{ $t("lp.feature") }}
    </div>

    <div class="grid grid-cols-2 gap-2 sm:gap-4 mt-4">
      <div class="bg-white rounded-lg p-5 pt-2 text-center">
        <div>
          <img
            class="object-cover w-2/3 sm:w-2/4 lg:w-1/3"
            src="/images/top/admin_icon1.png"
          />
        </div>
        <div
          class="text-black text-center text-op-90 text-sm sm:text-base font-bold mt-3"
        >
          {{ $t("lp.feature1") }}
        </div>
      </div>

      <div class="bg-white rounded-lg p-5 pt-2 text-center">
        <div>
          <img
            class="object-cover w-2/3 sm:w-2/4 lg:w-1/3"
            src="/images/top/admin_icon2.png"
          />
        </div>
        <div
          class="text-black text-center text-op-90 text-sm sm:text-base font-bold mt-3"
        >
          {{ $t("lp.feature2") }}
        </div>
      </div>

      <div class="bg-white rounded-lg p-5 pt-2 text-center">
        <div>
          <img
            class="object-cover w-2/3 sm:w-2/4 lg:w-1/3"
            src="/images/top/admin_icon3.png"
          />
        </div>
        <div
          class="text-black text-center text-op-90 text-sm sm:text-base font-bold mt-3"
        >
          {{ $t("lp.feature3") }}
        </div>
      </div>

      <div class="bg-white rounded-lg p-5 pt-2 text-center">
        <div>
          <img
            class="object-cover w-2/3 sm:w-2/4 lg:w-1/3"
            src="/images/top/admin_icon4.png"
          />
        </div>
        <div
          class="text-black text-center text-op-90 text-sm sm:text-base font-bold mt-3"
        >
          {{ $t("lp.feature4") }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>
