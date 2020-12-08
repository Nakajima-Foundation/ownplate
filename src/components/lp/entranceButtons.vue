<template>
  <div>
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Left Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <!-- For Owner -->
          <div class="m-t-24">

            <!-- Go to Owner Page -->
            <div class="align-center">
              <router-link to="/admin/restaurants">
                <div class="op-button-medium primary" style="min-width: 256px;">
                  <span class="c-onprimary">飲食店様のご利用申し込み</span>
                </div>
              </router-link>
            </div>

          </div>
        </div>
      </div>

      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <!-- For User -->
          <div class="m-t-24">
            <!-- Go to User Page -->
            <div class="align-center" v-if="!hideUsersLink">
              <router-link to="/r">
                <div class="op-button-medium primary" style="min-width: 256px;">
                  <span class="c-onprimary">お客さま入り口</span>
                </div>
              </router-link>
            </div>

          </div>
        </div>
      </div>
      <!-- Right Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <!-- For Inquiries -->
          <div class="m-t-24">
            <!-- Go to Inquiries Page -->
            <div class="align-center" v-if="!hideUsersLink">
              <router-link to="/r">
                <div class="op-button-medium bg-button-inquiries" style="min-width: 256px;">
                  <span class="c-onprimary">お問い合わせ</span>
                </div>
              </router-link>
            </div>

          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>
  </div>
</template>
<script>
export default {
}
</script>
