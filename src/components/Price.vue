<template>
  <span>
    <span>
      {{ $t("tax.price", {count: $n(price, "currency")}, 0) }}
      <span class="text-xs">{{ $t("tax.include") }}</span>
      <br />
    </span>
  </span>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "vue";

import { priceWithTax } from "@/utils/utils";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { MenuData } from "@/models/menu";

export default defineComponent({
  name: "Price",
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
    menu: {
      type: Object as PropType<MenuData>,
      required: true,
    },
    offset: {
      type: Number,
      required: false,
    },
  },
  setup(props) {
    const price = computed(() => {
      return priceWithTax(props.shopInfo, props.menu) + (props.offset || 0);
    });

    return {
      price,
    };
  },
});
</script>
