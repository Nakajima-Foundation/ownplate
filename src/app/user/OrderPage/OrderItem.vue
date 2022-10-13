<template>
  <div class="flex space-x-2">
    <b-checkbox v-if="editable" :value="available" @input="input" />
    <div>
      <div
        class="inline-flex h-9 w-12 flex-shrink-0 items-center justify-center rounded bg-blue-500 bg-opacity-10"
      >
        <div class="text-lg font-bold text-blue-500">
          {{ "x " + String(count) }}
        </div>
      </div>
      <div v-if="image" class="mt-1 flex-shrink-0">
        <img
          :src="image"
          @error="_smallImageErrorHandler"
          class="h-12 w-12 rounded object-cover"
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
      <div v-if="specialRequest" class="mt-1 text-xs font-bold">
        <s v-if="editable && !available">
          {{ specialRequest }}
        </s>
        <span v-else>
          {{ specialRequest }}
        </span>
      </div>
    </div>

    <div class="flex-shrink-0 text-right">
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
import { formatOption, optionPrice } from "@/utils/strings";
import { roundPrice, smallImageErrorHandler } from "@/utils/utils";

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
        const p = roundPrice(optionPrice(option));
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
    _smallImageErrorHandler(e) {
      smallImageErrorHandler(e);
    },
  },
};
</script>
