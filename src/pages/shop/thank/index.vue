<template>
  <section class="section">
    <div class="is-centered" style="margin-bottom:2rem;">
      <figure class="image is-3by2">
        <img src="/undraw_breakfast_psiw.svg" />
      </figure>
      <div style="text-align: center;margin-top:1rem;">
        <p class="p-big bold" style="line-height: 1.8rem;color:#02AA94">
          Thank you,
        </p>
        <p class="p-big bold" style="line-height: 1.4rem;color:#02AA94">
          Your order has been placed
        </p>
      </div>
      <div style="text-align:center;margin-top:1rem;">
        <p class="p-font">
          Please contact to the restaurant
        </p>
        <p class="p-font">
          to check, change, or cancel your order
        </p>
      </div>
    </div>

    <shop-orner-info
      :src="
        'https://pbs.twimg.com/profile_images/704153164438642692/bYo0YeEr_bigger.jpg'
      "
      :name="'Yuta Seatle'"
    ></shop-orner-info>

    <div style="margin-top:2rem;">
      <shop-info></shop-info>
    </div>

    <h2 class="p-big bold">
      Your order
    </h2>
    <order-info></order-info>
  </section>
</template>

<script>
import ShopOrnerInfo from "~/components/ShopOrnerInfo";
import OrderInfo from "~/components/OrderInfo";
import CreditCardInput from "~/components/CreditCardInput";
import ShopInfo from "~/components/ShopInfo";

export default {
  name: "Order",

  components: {
    ShopOrnerInfo,
    OrderInfo,
    ShopInfo
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
