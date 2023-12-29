<template>
  <div class="pt-10 px-6">
    <div
      class="bg-op-teal rounded-lg px-5 sm:py-6 pb-12 pt-6 px-auto sm:flex items-center justify-center text-center"
    >
      <div>
        <img
          class="object-cover w-40 sm:w-56"
          src="/images/top/takeout_icon.png"
        />
      </div>

      <div class="mt-4 sm:mt-0">
        <router-link to="/home">
          <div
            class="md:ml-12 sm:ml-2 inline-flex h-16 items-center rounded-full bg-white px-8 shadow hover:bg-opacity-90"
          >
            <span class="text-xl font-bold text-op-teal">
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
