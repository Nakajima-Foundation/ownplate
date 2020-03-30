<template>
  <section class="section" style="background-color:#fffafa">
    <h2 class="p-big bold">
      Orders
    </h2>
    <div>
      <div>
        <ordered-item v-for="order in orders" :key="order.id" :item="order" />
      </div>
    </div>
  </section>
  
</template>

<script>
import { db } from "~/plugins/firebase.js";
import OrderedItem from "~/components/OrderedItem";

export default {
  components: {
    OrderedItem
  },
  data() {
    return {
      orders: [{
        id:111,
        title:"one"
      }, {
        id:222,
        title:"two"
      }, {
        id:333,
        title:"three"
      }]
    }
  },
  computed: {
  },
  methods: {
  }
};
</script>

<style lang="scss">
</style>
