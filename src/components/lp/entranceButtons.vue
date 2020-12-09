<template>
  <div>
    <div class="columns m-t-24 p-b-16">
      <div class="column is-narrow w-24"></div>

      <!-- For Restaurants -->
      <div
        class="column bg-primary r-8 m-l-24 m-r-24 align-center p-t-24 p-l-24 p-r-24 p-b-32"
      >
        <i class="material-icons c-text-black-disabled s-64">store</i>
        <div class="t-subtitle2 c-ownplate-white">
          飲食店の方はこちら
        </div>
        <router-link to="/admin/restaurants">
          <div
            class="op-button-medium bg-ownplate-white m-t-16 m-l-16 m-r-16 p-l-32 p-r-32 c-text-black-medium"
          >
            ご利用を開始
          </div>
        </router-link>
        <a
          href="https://gluepass.jp/g/ownplatejp/pg/Zy8VserQdTxFVKLaFcOK"
          target="_blank"
        >
          <div
            class="op-button-medium bg-ownplate-yellow m-t-16 m-l-16 m-r-16 p-l-32 p-r-32 c-text-black-medium"
          >
            お問い合わせ
          </div>
        </a>
      </div>

      <!-- Gap for Mobile -->
      <div class="h-16 is-hidden-tablet"></div>

      <!-- For Food Lovers -->
      <div
        class="column is-narrow bg-ownplate-yellow r-8 m-l-24 m-r-24 align-center p-t-24 p-l-24 p-r-24 p-b-32"
      >
        <i class="material-icons c-text-black-disabled s-64">local_mall</i>
        <div class=" t-subtitle2 c-text-black-medium">
          テイクアウトご利用のお客様はこちら
        </div>
        <router-link to="/r">
          <div class="op-button-small c-ownplate-white bg-primary m-t-16">
            テイクアウトのお店を探す
          </div>
        </router-link>
      </div>
      <div class="column is-narrow w-24"></div>
    </div>
  </div>
</template>
<script>
export default {};
</script>
