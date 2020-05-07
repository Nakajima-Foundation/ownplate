<template>
  <section class="section">
    <back-button url="/s" />
    <h2>All Orders</h2>
  </section>
</template>

<script>
import BackButton from "~/components/BackButton";
import { db } from "~/plugins/firebase.js";
import OrderedInfo from "~/app/admin/Order/OrderedInfo";

export default {
  components: {
    OrderedInfo,
    BackButton
  }
};
</script>
