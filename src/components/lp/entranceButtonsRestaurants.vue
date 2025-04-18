<template>
  <!-- For Restaurants -->
  <div class="rounded-lg bg-op-teal pt-6 lg:col-span-2">
    <i class="material-icons text-7xl opacity-60">store</i>
    <div class="text-sm font-bold text-white">
      {{ $t("lp.forOwner") }}
    </div>
    <div class="pb-4 lg:inline-flex lg:space-x-8">
      <!-- Go to Restaurant Admin Page -->
      <div class="mt-4">
        <router-link to="/admin/restaurants">
          <div
            class="inline-flex h-16 items-center rounded-full bg-white px-8 shadow-sm"
          >
            <span class="text-xl font-bold text-black opacity-60">{{
              $t("lp.tryService")
            }}</span>
          </div>
        </router-link>
      </div>
      <!-- Go to Contact Page -->
      <div class="mt-4">
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfGR4kk65ynfkCRGJsvJz01HZf7AU1nGLL9Rn9i4G9-qiW6MQ/viewform"
          target="_blank"
        >
          <div
            class="inline-flex h-16 items-center rounded-full bg-ownplate-yellow px-8 shadow-sm hover:bg-opacity-30"
          >
            <span class="text-xl font-bold text-black opacity-60">{{
              $t("lp.ask")
            }}</span>
          </div>
        </a>
      </div>
    </div>
    <!-- Go to Samples -->
    <div class="rounded-b-lg bg-black bg-opacity-10 py-4">
      <div class="lg:inline-flex lg:items-center lg:space-x-4">
        <div class="mb-2 text-sm font-bold text-white lg:mb-0">
          {{ $t("lp.goToSampleRestaurant") }}
        </div>
        <div class="inline-flex items-center space-x-4">
          <a
            href="https://omochikaeri.com/r/bYArBMUJBe4KdVzZijLH"
            class="inline-flex h-10 items-center rounded-full bg-white bg-opacity-20 px-4 hover:bg-opacity-30"
          >
            <span class="text-sm font-bold text-white">{{
              $t("lp.izakaya")
            }}</span>
          </a>
          <a
            href="https://omochikaeri.com/r/wwCgtIEZQo6QnXRyxYYS"
            class="inline-flex h-10 items-center rounded-full bg-white bg-opacity-20 px-4 hover:bg-opacity-30"
          >
            <span class="text-sm font-bold text-white">{{
              $t("lp.patisserie")
            }}</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({});
</script>
