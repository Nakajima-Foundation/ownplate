<template>
  <div class="flex space-x-2">
    <div>
      <div
        class="inline-flex justify-center items-center h-9 w-12 bg-blue-500 bg-opacity-10 rounded flex-shrink-0"
      >
        <div class="text-lg font-bold text-blue-500">
          {{ "x " + String(count) }}
        </div>
      </div>
      <div v-if="image" class="flex-shrink-0 mt-1">
        <img
          :src="image"
          width="48"
          height="48"
          class="w-12 h-12 rounded cover"
        />
      </div>
    </div>

    <div class="flex-1">
      <div class="text-base font-bold">
        {{ item.itemName }}
      </div>
      <div v-if="specialRequest" class="text-xs font-bold mt-1">
        {{ specialRequest }}
      </div>
    </div>

    <div class="text-right flex-shrink-0">
      <span class="text-base font-bold text-black text-opacity-30">{{
        $n(totalPrice, "currency")
      }}</span>
    </div>
  </div>
</template>

<script>
import store from "~/store/index.js";
import { mapGetters, mapMutations } from "vuex";
import { formatOption, optionPrice } from "~/plugins/strings.js";

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
    image() {
      return (
        (this.item?.images?.item?.resizedImages || {})["600"] ||
        this.item.itemPhoto
      );
    },
    count() {
      return this.orderItem.count;
    },
    specialRequest() {
      return this.orderItem.options
        .filter(choice => choice)
        .map(choice => this.displayOption(choice))
        .join(", ");
    },
    totalPrice() {
      let price = this.item.price;
      const m = this.$store.getters.stripeRegion.multiple;
      this.orderItem.options.forEach(option => {
        const p = Math.round(optionPrice(option) * m) / m;
        price += p;
      });
      return price * this.count;
    }
  },
  methods: {
    displayOption(option) {
      return formatOption(option, price => this.$n(price, "currency"));
    }
  }
};
</script>
