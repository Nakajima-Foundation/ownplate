<template>
  <div class="flex space-x-2">
    <b-checkbox v-if="editable" :value="available" @input="input" />
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
          class="w-12 h-12 rounded object-cover"
        />
      </div>
    </div>

    <div class="flex-1">
      <div class="text-base font-bold">
        <s v-if="editable && !available">
          {{ item.itemName }}
        </s>
        <span v-else>
          {{ item.itemName }}
        </span>
        <span v-if="isAdmin && item.itemAliasesName">
          <s v-if="editable && !available"> / {{ item.itemAliasesName }} </s>
          <span v-else> / {{ item.itemAliasesName }} </span>
        </span>
      </div>
      <div v-if="specialRequest" class="text-xs font-bold mt-1">
        <s v-if="editable && !available">
          {{ specialRequest }}
        </s>
        <span v-else>
          {{ specialRequest }}
        </span>
      </div>
    </div>

    <div class="text-right flex-shrink-0">
      <span class="text-base font-bold text-black text-opacity-30">
        <s v-if="editable && !available">
          {{ $n(totalPrice, "currency") }}
        </s>
        <span v-else>
          {{ $n(totalPrice, "currency") }}
        </span>
      </span>
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
      required: true,
    },
    editable: {
      type: Boolean,
      required: false,
    },
    available: {
      type: Boolean,
      required: false,
    },
    mkey: {
      type: Number,
      required: true,
    },
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
    isAdmin() {
      return this.$store.getters.isAdmin;
    },
    specialRequest() {
      return this.orderItem.options
        .filter((choice) => choice)
        .map((choice) => this.displayOption(choice))
        .join(", ");
    },
    totalPrice() {
      let price = this.item.price;
      this.orderItem.options.forEach((option) => {
        const p = this.roundPrice(optionPrice(option));
        price += p;
      });
      return price * this.count;
    },
  },
  methods: {
    input(value) {
      this.$emit("input", [this.mkey, value]);
    },
    displayOption(option) {
      return formatOption(option, (price) => this.$n(price, "currency"));
    },
  },
};
</script>
