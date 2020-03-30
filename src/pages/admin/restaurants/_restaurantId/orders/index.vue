<template>
  <section class="section" style="background-color:#fffafa">
    <h2 class="p-big bold">
      Orders
    </h2>
    <div>
      <div>
        <ordered-item v-for="order in orders" :key="order.id" :order="order" />
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
        totalCount: 3,
        totalPrice: "$20.15",
        phone: "(333)444-5555",
        pickupTime: "4:41pm",
        title:"#0001"
      }, {
        id:222,
        totalCount: 12,
        totalPrice: "$120.30",
        phone: "(222)444-5555",
        pickupTime: "4:35pm",
        title:"#0002"
      }, {
        id:333,
        totalCount: 4,
        totalPrice: "$42.15",
        phone: "(444)444-5555",
        pickupTime: "4:30pm",
        title:"#0003"
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
