<template>
  <!-- admin feature -->
  <div class="px-6 pt-10">
    <div class="text-op-90 text-center text-2xl font-bold text-black">
      {{ $t("lp.feature") }}
    </div>

    <div class="mt-4 grid grid-cols-2 gap-2 sm:gap-4">
      <div class="rounded-lg bg-white p-5 pt-2 text-center">
        <div>
          <img
            class="w-2/3 object-cover sm:w-2/4 lg:w-1/3"
            src="/images/top/admin_icon1.png"
          />
        </div>
        <div
          class="text-op-90 mt-3 text-center text-sm font-bold text-black sm:text-base"
        >
          {{ $t("lp.feature1") }}
        </div>
      </div>

      <div class="rounded-lg bg-white p-5 pt-2 text-center">
        <div>
          <img
            class="w-2/3 object-cover sm:w-2/4 lg:w-1/3"
            src="/images/top/admin_icon2.png"
          />
        </div>
        <div
          class="text-op-90 mt-3 text-center text-sm font-bold text-black sm:text-base"
        >
          {{ $t("lp.feature2") }}
        </div>
      </div>

      <div class="rounded-lg bg-white p-5 pt-2 text-center">
        <div>
          <img
            class="w-2/3 object-cover sm:w-2/4 lg:w-1/3"
            src="/images/top/admin_icon3.png"
          />
        </div>
        <div
          class="text-op-90 mt-3 text-center text-sm font-bold text-black sm:text-base"
        >
          {{ $t("lp.feature3") }}
        </div>
      </div>

      <div class="rounded-lg bg-white p-5 pt-2 text-center">
        <div>
          <img
            class="w-2/3 object-cover sm:w-2/4 lg:w-1/3"
            src="/images/top/admin_icon4.png"
          />
        </div>
        <div
          class="text-op-90 mt-3 text-center text-sm font-bold text-black sm:text-base"
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
