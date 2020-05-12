<template>
  <span>
    <span v-if="shopInfo.taxInclude">{{$tc('tax.include', taxObj.total_price_i18n)}}<br/></span>
    <span v-if="!shopInfo.taxInclude">{{$tc('tax.exclude', taxObj.price_i18n)}}<br/></span>

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
      const price = Number(this.menu.price);
      const multiple =  this.$store.getters.stripeRegion.multiple;
      const taxRate =  this.menu.tax === "alcohol" ? this.shopInfo.alcoholTax : this.shopInfo.foodTax;
      const tax = Math.round(((price * taxRate) / 100 )* multiple) / multiple;
      const total = price + tax;

      return {
        price_i18n: this.$n(price,  'currency'),
        tax_i18n: this.$n(tax, 'currency'),
        total_price_i18n: this.$n(total,  'currency')
      };
    }
  },
}
</script>
