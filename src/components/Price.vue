<template>
  <span>
    <span>
      {{ $tc("tax.price", $n(price, "currency")) }}
      <span class="text-xs">{{ $tc("tax.include") }}</span>
      <br />
    </span>
  </span>
</template>

<script>
import {
  defineComponent,
  computed,
} from "@vue/composition-api";

export default defineComponent({
  name: "Price",
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    menu: {
      type: Object,
      required: true,
    },
  },
  setup(props, ctx) {
    const price = computed(() => {
      return Math.round(
        ((menu, shopInfo) => {
          if (!shopInfo.inclusiveTax) {
            if (props.menu.tax === "alcohol") {
              return (1 + shopInfo.alcoholTax * 0.01) * menu.price;
            }
              return (1 + shopInfo.foodTax * 0.01) * menu.price;
          } else {
            return menu.price;
          }
        })(props.menu, props.shopInfo)
      );
    });
    
    return {
      price,
    };
  },
});
</script>
