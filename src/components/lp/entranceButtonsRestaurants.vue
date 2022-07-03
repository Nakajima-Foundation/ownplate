<template>
  <!-- For Restaurants -->
  <div class="bg-op-teal rounded-lg pt-6 lg:col-span-2">
    <i class="material-icons text-7xl opacity-60">store</i>
    <div class="text-white text-sm font-bold">
      {{ $t("lp.forOwner") }}
    </div>
    <div class="pb-4 lg:inline-flex lg:space-x-8">
      <!-- Go to Restaurant Admin Page -->
      <div class="mt-4">
        <router-link to="/admin/restaurants">
          <div
            class="h-16 rounded-full bg-white inline-flex items-center px-8 shadow"
          >
            <span class="text-black opacity-60 text-xl font-bold">{{
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
            class="h-16 rounded-full bg-op-yellow inline-flex items-center px-8 shadow"
          >
            <span class="text-black opacity-60 text-xl font-bold">{{
              $t("lp.ask")
            }}</span>
          </div>
        </a>
      </div>
    </div>
    <!-- Go to Samples -->
    <div class="bg-black bg-opacity-10 rounded-b-lg py-4">
      <div class="lg:inline-flex lg:items-center lg:space-x-4">
        <div class="text-white text-sm font-bold mb-2 lg:mb-0">
          {{ $t("lp.goToSampleRestaurant") }}
        </div>
        <div class="inline-flex items-center space-x-4">
          <a
            href="https://omochikaeri.com/r/bYArBMUJBe4KdVzZijLH"
            class="inline-flex items-center h-10 rounded-full bg-white bg-opacity-20 px-4 hover:bg-opacity-30"
          >
            <span class="text-white text-sm font-bold">{{
              $t("lp.izakaya")
            }}</span>
          </a>
          <a
            href="https://omochikaeri.com/r/wwCgtIEZQo6QnXRyxYYS"
            class="inline-flex items-center h-10 rounded-full bg-white bg-opacity-20 px-4 hover:bg-opacity-30"
          >
            <span class="text-white text-sm font-bold">{{
              $t("lp.patisserie")
            }}</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>
