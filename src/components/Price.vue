<template>
  <span>
    <span v-if="shopInfo.inclusiveTax">
      {{$tc('tax.price', taxObj.price_i18n) }}
      <span
        class="t-caption c-text-black-medium"
      >{{$tc('tax.include')}}</span>
      <br />
    </span>
    <span v-if="!shopInfo.inclusiveTax">
      {{$tc('tax.price', taxObj.price_i18n)}}
      <span
        class="t-caption c-text-black-medium"
      >{{$tc('tax.exclude')}}</span>
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
      const price = Number(this.menu.price);

      return {
        price_i18n: this.$n(price, "currency")
      };
    }
  }
};
</script>
