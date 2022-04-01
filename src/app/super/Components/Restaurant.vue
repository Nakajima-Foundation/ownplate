<template>
  <router-link :to="`/r/${restaurant.id}`">{{restaurant.restaurantName}}</router-link>
</template>

<script>
export default {
  props: {
    restaurant: {
      type: Object,
      required: true
    }
  }
};
</script>
