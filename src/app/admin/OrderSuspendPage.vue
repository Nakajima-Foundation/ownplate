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
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>

      <!-- Left Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <div class="t-h6 c-text-black-disabled m-t-24">{{ $t("admin.order.suspendSettings") }}</div>
          <div
            class="bg-surface r-8 d-low p-l-16 p-r-16 p-t-16 p-b-16 m-t-8"
          >Will put sespend settings here.</div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <div class="m-t-24">
            <!-- Menu Items -->
            <template v-for="itemId in menuLists">
              <div v-if="itemsObj[itemId]" :key="itemId">
                <div
                  class="t-h6 c-text-black-disabled m-t-24"
                  v-if="itemsObj[itemId]._dataType === 'title'"
                >{{ itemsObj[itemId].name }}</div>
                <order-suspend-item
                  v-if="itemsObj[itemId]._dataType === 'menu'"
                  :item="itemsObj[itemId]"
                  :shopInfo="shopInfo"
                ></order-suspend-item>
              </div>
            </template>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>
  </div>
</template>

<script>
import { db, firestore, functions } from "~/plugins/firebase.js";
import BackButton from "~/components/BackButton";
import OrderSuspendItem from "~/app/admin/Order/OrderSuspendItem";

export default {
  components: {
    OrderSuspendItem,
    BackButton
  },
  data() {
    return {
      shopInfo: {},
      menus: [],
      titles: [],
      detacher: [],
      notFound: null
    };
  },
  created() {
    const restaurant_detacher = db
      .doc(`restaurants/${this.restaurantId()}`)
      .onSnapshot(restaurant => {
        const restaurant_data = restaurant.data();
        this.shopInfo = restaurant_data;
        if (
          restaurant.exists &&
          !restaurant.data().deletedFlag &&
          restaurant.data().publicFlag
        ) {
          this.notFound = false;
        } else {
          this.notFound = true;
        }
      });
    const menu_detacher = db
      .collection(`restaurants/${this.restaurantId()}/menus`)
      .where("deletedFlag", "==", false)
      .where("publicFlag", "==", true)
      .onSnapshot(menu => {
        if (!menu.empty) {
          this.menus = menu.docs
            .filter(a => {
              const data = a.data();
              return data.validatedFlag === undefined || data.validatedFlag;
            })
            .map(this.doc2data("menu"));
        }
      });
    const title_detacher = db
      .collection(`restaurants/${this.restaurantId()}/titles`)
      .onSnapshot(title => {
        if (!title.empty) {
          this.titles = title.docs.map(this.doc2data("title"));
        }
      });
    this.detacher = [restaurant_detacher, menu_detacher, title_detacher];
  },
  destroyed() {
    if (this.detacher) {
      this.detacher.map(detacher => {
        detacher();
      });
    }
  },
  computed: {
    itemsObj() {
      return this.array2obj(this.menus.concat(this.titles));
    },
    menuLists() {
      const list = this.shopInfo.menuLists || [];
      return list;
    }
  }
};
</script>