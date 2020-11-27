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
                  <span class="c-onprimary">{{ $t("menu.admins") }}</span>
                </div>
              </router-link>
            </div>

          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <!-- For User -->
          <div class="m-t-24">
            <!-- Go to User Page -->
            <div class="align-center" v-if="!hideUsersLink">
              <router-link to="/r">
                <div class="op-button-medium primary" style="min-width: 256px;">
                  <span class="c-onprimary">{{ $t("menu.users") }}</span>
                </div>
              </router-link>
            </div>

          </div>
        </div>
      </div>
      <!-- Right Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <!-- For User -->
          <div class="m-t-24">
            <!-- Go to User Page -->
            <div class="align-center" v-if="!hideUsersLink">
              <router-link to="/r">
                <div class="op-button-medium primary" style="min-width: 256px;">
                  <span class="c-onprimary">{{ $t("menu.users") }}</span>
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
