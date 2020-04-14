<template></template>

<script>
import { db, firestore } from "~/plugins/firebase.js";
import RestaurantEditCard from "~/components/RestaurantEditCard";
import { order_status } from "~/plugins/constant.js";

export default {
  name: "Restaurant",
  components: {
    RestaurantEditCard
  },
  data() {
    return {};
  },
  created() {},
  async mounted() {},
  methods: {},
  destroyed() {},
  computed: {
    stripeLink() {
      return `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_GyPukeEMH37oDt0ZBNMNC7Ig7tWYNWlM&scope=read_write`;
    }
  }
};
</script>
<style lang="scss" scoped>
.tax {
  margin-top: -2rem !important;
}
</style>
