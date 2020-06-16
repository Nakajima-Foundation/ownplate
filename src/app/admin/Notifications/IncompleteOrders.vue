<template>
  <div>
    <div
      class="t-subtitle2 c-text-black-medium m-t-16"
      >{{ $t("admin.order.incompleteOrders") }}</div>
    <!-- Links for Incomplete Orders Date -->
    <div>
      <!-- # Show latest date first -->
      <!-- # Make Red Color for Today -->
      <router-link
        class="op-button-pill bg-status-red-bg m-t-8 m-r-8"
        :to="`/admin/restaurants/${restaurantId()}/orders`"
        >
        <!-- # Link to the date -->
        <span class="t-button c-status-red">2020年6月16日(火) 本日 - 3</span>
      </router-link>

      <!-- # Future Date will be Nomal Color -->
      <router-link
        class="op-button-pill bg-form m-t-8 m-r-8"
        :to="`/admin/restaurants/${restaurantId()}/orders`"
        >
        <span class="t-button c-primary">2020年6月17日(水) - 2</span>
      </router-link>
      <router-link
        class="op-button-pill bg-form m-t-8 m-r-8"
        :to="`/admin/restaurants/${restaurantId()}/orders`"
        >
        <span class="t-button c-primary">2020年6月18日(木) - 3</span>
      </router-link>
      <router-link
        class="op-button-pill bg-form m-t-8 m-r-8"
        :to="`/admin/restaurants/${restaurantId()}/orders`"
        >
        <span class="t-button c-primary">2020年6月19日(金) - 10</span>
      </router-link>
    </div>
  </div>
</template>
