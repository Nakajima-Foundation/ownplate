<template>
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
</template>

<script>
import OrderItem from "~/components/OrderItem";
export default {
  name: "Order",

  components: {
    OrderItem
  },

  methods: {}
};
</script>
<style type="scss" scped>
.tax {
  margin-top: -2rem !important;
}
</style>
