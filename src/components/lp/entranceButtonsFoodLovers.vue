<template>
  <!-- For Food Lovers -->
  <div class="bg-white rounded-lg p-6 mt-4 lg:mt-0">
    <i class="material-icons text-7xl opacity-60">local_mall</i>
    <div class="text-black opacity-60 text-sm font-bold">
      {{ $t("lp.forCustomer") }}
    </div>
    <!-- Go to Restaurants List -->
    <div class="mt-4">
      <router-link to="/r">
        <div
          class="h-12 rounded-full bg-op-teal inline-flex items-center px-8 shadow"
        >
          <span class="text-white text-base font-bold">
            {{ $t("lp.searchRestaurant") }}</span
          >
        </div>
      </router-link>
    </div>

    <!-- Go to Samples -->
    <div class="rounded-b-lg py-4">
      <div class="lg:inline-flex lg:items-center lg:space-x-4">
        <div class="inline-flex items-center space-x-4">
          <router-link
            to="/r/area/12"
            class="inline-flex items-center h-10 bg-op-yellow rounded-full bg-opacity-20 px-4 hover:bg-opacity-30"
          >
            <span class="text-white text-sm font-bold">{{
              $t("lp.tokyo")
            }}</span>
          </router-link>
          <router-link
            to="/r/area/26"
            class="inline-flex items-center h-10 bg-op-yellow rounded-full bg-opacity-20 px-4 hover:bg-opacity-30"
          >
            <span class="text-white text-sm font-bold">{{
              $t("lp.osaka")
            }}</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>
