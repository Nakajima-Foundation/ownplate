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
    <div class="card block">
      <order-item
        :title="'Kushikatsu Special PlatterPlatter'"
        :payment="'$26.00'"
        :option="'($3.00 ea.)'"
        :option-payment="'Put the dressing on the side.'"
      ></order-item>

      <order-item :title="'Spicy Eggplant'" :payment="'$8.00'"></order-item>

      <order-item
        :title="'Spicy Eggplant'"
        :payment="'$8.00'"
        :option="'($3.00 ea.)'"
        :option-payment="'Put the dressing on the side.'"
      ></order-item>

      <hr class="hr-black" />

      <div class="card-content subtotal">
        <div class="media">
          <div class="media-content">
            <h4 class="bold">
              Subtotal
            </h4>
          </div>
          <div class="media-right" style="margin-top:-0.4rem;">
            <p class="p-bold">
              $40.00
            </p>
          </div>
        </div>
      </div>

      <div class="card-content tax" style="margin-top: -1rem;">
        <div class="media">
          <div class="media-content">
            <h4 class="bold">
              Sales Tax
            </h4>
          </div>
          <div class="media-right" style="margin-top:-0.4rem;">
            <p class="p-bold">
              $4.00
            </p>
          </div>
        </div>
      </div>

      <div class="card-content">
        <div class="media">
          <div class="media-content">
            <h3 class="bold">
              Total
            </h3>
          </div>
          <div class="media-right">
            <p class="p-big bold" style="color:#CB4B4B">
              $44.00
            </p>
          </div>
        </div>
      </div>
    </div>

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
        style="margin-top:4rem;"
        size="is-large"
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
import OrderItem from "~/components/OrderItem";
import CreditCardInput from "~/components/CreditCardInput";

export default {
  name: "Order",

  components: {
    ShopOrnerInfo,
    OrderItem,
    CreditCardInput
  }
};
</script>
<style lang="scss" scoped>
.tax {
  margin-top: -2rem !important;
}
</style>
