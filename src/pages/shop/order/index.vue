<template>
  <section class="section">
    <shop-orner-info
      :src="
        'https://pbs.twimg.com/profile_images/704153164438642692/bYo0YeEr_bigger.jpg'
      "
      :name="'Yuta Seatle'"
    ></shop-orner-info>
    <h2 class="p-big bold">
      Your order
    </h2>
    <order-info></order-info>
    <div class="is-centered" style="text-align: center;">
      <b-button expanded rounded style="margin-bottom:1rem;">
        Add more items
      </b-button>

      <n-link :to="{ path: '/shop/menu' }">
        Remove all items
      </n-link>
    </div>

    <hr class="hr-black" />

    <h2 class="p-big bold">
      Your payment
    </h2>
    <credit-card-input></credit-card-input>

    <div class="is-centered" style="text-align: center;">
      <b-button
        type="is-info"
        expanded
        rounded
        style="margin-top:4rem;padding-top: 0.2rem;"
        size="is-large"
        @click="goNext"
      >
        <span class="p-font bold">
          Place order: $44.00
        </span>
      </b-button>
    </div>
  </section>
</template>

<script>
import ShopOrnerInfo from "~/components/ShopOrnerInfo";
import OrderInfo from "~/components/OrderInfo";
import CreditCardInput from "~/components/CreditCardInput";

export default {
  name: "Order",

  components: {
    ShopOrnerInfo,
    OrderInfo,
    CreditCardInput
  },

  methods: {
    goNext() {
      this.$router.push({ path: "/shop/thank" });
    }
  }
};
</script>
<style lang="scss" scoped>
.tax {
  margin-top: -2rem !important;
}
</style>
