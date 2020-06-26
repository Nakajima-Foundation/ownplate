<template>
  <div>
    <!-- Header Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <!-- Nav Bar -->
          <div class="level">
            <!-- Back Button and Restaurant Profile -->
            <div class="level-left flex-1">
              <!-- Back Button -->
              <back-button
                :url="`/admin/restaurants/${restaurantId()}/orders`"
                class="m-t-24 m-r-16"
              />

              <!-- Restaurant Profile -->
              <div class="is-inline-flex flex-center m-t-24">
                <div>
                  <img :src="shopInfo.restProfilePhoto" class="w-36 h-36 r-36 cover" />
                </div>
                <div class="t-h6 c-text-black-high m-l-8 flex-1">{{ shopInfo.restaurantName }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>

    <!-- Body Area -->
    <div>ToDo: Show all menu items with checkbox for suspending on/off.</div>
  </div>
</template>

<script>
import { db, firestore } from "~/plugins/firebase.js";
import BackButton from "~/components/BackButton";

export default {
  components: {
    BackButton
  },
  data() {
    return {
      shopInfo: {},
      order_detacher: () => {}
    };
  },
  async created() {
    this.checkAdminPermission();
    const restaurantDoc = await db
      .doc(`restaurants/${this.restaurantId()}`)
      .get();
    if (!restaurantDoc.exists) {
      // todo not found
      return;
    }
    this.shopInfo = restaurantDoc.data();
  },
  destroyed() {
    this.order_detacher();
  }
};
</script>