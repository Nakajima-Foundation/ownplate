<template>
  <nuxt-link :to="`/r/${restaurant.id}`">{{restaurant.restaurantName}}</nuxt-link>
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
