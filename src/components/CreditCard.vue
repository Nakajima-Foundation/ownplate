<template>
  <span>
    <div class="columns is-mobile is-left" style="margin-bottom:-0.8rem;"></div>

    <div class="tags is-mobile is-left">
      <span>
        <img class="card_image" src="/card-image/visa.svg" />
      </span>
      <span>
        <img class="card_image" src="/card-image/master.svg" />
      </span>
      <span class="last_third_image">
        <img class="card_image" src="/card-image/jcb.svg" />
      </span>
      <span class="last_second_image">
        <img class="card_image" src="/card-image/amex.svg" />
      </span>
      <span class="last_image">
        <img class="card_image" src="/card-image/diners.svg" />
      </span>
    </div>
    <div class="columns is-mobile is-left" style="margin-top:-1.4rem;">
      <p class="p-font-mini">
        （VISA, MasterCard, AmericanExpress, JCB, Diners Club）
      </p>
    </div>
  </span>
</template>

<script>
export default {};
</script>
<style type="scss" scped>
.card_image {
  margin-right: 0.4rem;
}
.card_image {
  height: 62px;
  width: 62px;
}
</style>
