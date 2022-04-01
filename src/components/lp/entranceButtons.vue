<template>
  <div class="mx-6 mt-6 text-center lg:grid lg:grid-cols-3 lg:gap-4">
    <!-- For Restaurants -->
    <entrance-buttons-restaurants />

    <!-- For Food Lovers -->
    <entrance-buttons-food-lovers />
  </div>
</template>

<script>
import entranceButtonsRestaurants from "~/components/lp/entranceButtonsRestaurants";
import entranceButtonsFoodLovers from "~/components/lp/entranceButtonsFoodLovers";

export default {
  components: {
    entranceButtonsRestaurants,
    entranceButtonsFoodLovers,
  },
};
</script>
