<template>
  <div class="p-t-16 p-l-16 p-r-16">
    <div class="cols">
      <div class="flex-1">
        <div
          class="t-body1 c-text-black-high"
        >{{ item.itemName }} {{count > 1 ? " x " + String(count) : "" }}</div>
        <div
          v-if="specialRequest"
          class="p-l-8 p-r-8 p-t-8 t-caption c-text-black-medium"
        >{{ specialRequest }}</div>
      </div>
      <div class="align-righ">
        <span class="t-body1 c-text-black-high">{{ $n(totalPrice, 'currency') }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import store from "~/store/index.js";
import { mapGetters, mapMutations } from "vuex";
export default {
  props: {
    orderItem: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      counter: 0,
      openMenuFlag: false
    };
  },
  computed: {
    item() {
      return this.orderItem.item;
    },
    count() {
      return this.orderItem.count;
    },
    specialRequest() {
      return this.orderItem.specialRequest;
    },
    totalPrice() {
      let price = this.item.price;
      // TODO: Add option prices here
      price += 10;
      return price * this.count;
    }
  },
  methods: {}
};
</script>
