<template>
  <span>
    <span v-if="true">
      {{ $tc("tax.price", taxObj.price_i18n) }}
      <span class="text-xs">{{ $tc("tax.include") }}</span>
      <br />
    </span>
    <span v-else >
      {{ $tc("tax.price", taxObj.price_i18n) }}
      <span class="text-xs">{{ $tc("tax.exclude") }}</span>
      <br />
    </span>
  </span>
</template>

<script>
export default {
  name: "Price",
  props: {
    shopInfo: {
      type: Object,
      required: true
    },
    menu: {
      type: Object,
      required: true
    }
  },
  computed: {
    taxObj() {
      const price =  Math.round(((menu, shopInfo) => {
        if (!shopInfo.inclusiveTax) {
          if (this.menu.tax === "alcohol") {
            return (1 + shopInfo.alcoholTax * 0.01) * menu.price;
          }
          return (1 + shopInfo.foodTax * 0.01) * menu.price;
        } else {
          return menu.price;
        }
      })(this.menu, this.shopInfo));

      return {
        price_i18n: this.$n(price, "currency")
      };
    }
  }
};
</script>
