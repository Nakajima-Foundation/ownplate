<template>
  <div>
    <template v-if="notFound == null"></template>
    <template v-else-if="notFound && !isOwner">
      <not-found />
    </template>
    <template v-else>
      <div>
        <!-- For Owner Preview Only -->
        <div v-if="isPreview" class="columns is-gapless">
          <!-- Left Gap -->
          <div class="column is-narrow w-24"></div>
          <!-- Center Column -->
          <div class="column">
            <div
              class="bg-status-red-bg r-8 p-l-16 p-r-16 p-t-16 p-b-16 align-center m-l-24 m-r-24 m-t-24"
            >
              <div class="t-subtitle1 c-status-red">{{$t("shopInfo.thisIsPreview")}}</div>
              <div class="t-subtitle1 c-status-red">{{$t("shopInfo.notPublic")}}</div>
            </div>
            <div class="is-hidden-tablet h-24"></div>
          </div>
          <!-- Right Gap -->
          <div class="column is-narrow w-24"></div>
        </div>

        <!-- Restaurant Body Area -->
        <div class="columns is-gapless">
          <!-- Left Gap -->
          <div class="column is-narrow w-24"></div>

          <!-- Left Column -->
          <div class="column">
            <!-- Restaurant Cover Photo -->
            <div class="columns is-gapless">
              <div class="column is-narrow w-24"></div>
              <div class="column">
                <div class="is-hidden-mobile h-24"></div>
                <div class="bg-form h-192">
                  <img :src="coverImage" class="h-192 w-full cover is-hidden-tablet" />
                  <img :src="coverImage" class="h-192 w-full cover r-8 is-hidden-mobile" />
                </div>
              </div>
              <div class="column is-narrow w-24"></div>
            </div>

            <!-- Restaurant Details -->
            <div class="m-l-24 m-r-24">
              <!-- Restaurant Profile Photo and Name -->
              <shop-header :shopInfo="shopInfo"></shop-header>

              <!-- Restaurant Descriptions -->
              <div class="t-body1 c-text-black-medium m-t-8">{{ this.shopInfo.introduction }}</div>

              <!-- Share Popup -->
              <share-popup :shopInfo="shopInfo" class="align-center m-t-8"></share-popup>

              <!-- Restaurant Info -->
              <shop-info :shopInfo="shopInfo" :paymentInfo="paymentInfo"
                         @noAvailableTime="noAvailableTime=$event"
                         ></shop-info>
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
                    <item-card
                      v-if="itemsObj[itemId]._dataType === 'menu'"
                      :item="itemsObj[itemId]"
                      :count="orders[itemId] || 0"
                      :optionPrev="optionsPrev[itemId]"
                      :initialOpenMenuFlag="(orders[itemId] || 0) > 0"
                      :shopInfo="shopInfo"
                      :isOpen="menuId === itemId"
                      @didCountChange="didCountChange($event)"
                      @didOptionValuesChange="didOptionValuesChange($event)"
                    ></item-card>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <!-- Right Gap -->
          <div class="column is-narrow w-24"></div>
        </div>
      </div>

      <!-- Phone Login-->
      <b-modal :active.sync="loginVisible" :width="488" scroll="keep">
        <div class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
          <phone-login v-on:dismissed="handleDismissed" />
        </div>
      </b-modal>

      <!-- Cart Button -->
      <div
        v-if="isCheckingOut"
        style="position: fixed; top: 0px; left: 0px;"
        class="w-full h-full bg-dialog-overlay"
      ></div>
      <b-button
        class="b-reset op-button-large primary"
        style="width: 288px; position: fixed; bottom: 32px; left: 50%; margin-left: -144px;"
        v-if="0 != totalCount"
        :loading="isCheckingOut"
        :disabled="isCheckingOut || noPaymentMethod || noAvailableTime"
        @click="handleCheckOut"
      >
        <div class="is-flex flex-center">
          <template v-if="noPaymentMethod">
            <div class="flex-1 align-center c-onprimary">{{ $t("shopInfo.noPaymentMethod") }}</div>
          </template>
          <template v-else-if="noAvailableTime">
            <div class="flex-1 align-center c-onprimary">{{ $t("shopInfo.noAvailableTime") }}</div>
          </template>
          <template v-else="!noPaymentMethod">
            <div class="flex-1 align-left c-onprimary m-r-16">
              {{
              $tc("sitemenu.orderCounter", totalCount, { count: totalCount })
              }}
            </div>
            <div class="m-r-8 c-onprimary">{{ $t("sitemenu.checkout") }}</div>
            <i class="material-icons c-onprimary">shopping_cart</i>
          </template>
        </div>
      </b-button>
    </template>
  </div>
</template>

<script>
import ItemCard from "~/app/user/Restaurant/ItemCard";
import PhoneLogin from "~/app/auth/PhoneLogin";
import ShopHeader from "~/app/user/Restaurant/ShopHeader";
import SharePopup from "~/app/user/Restaurant/SharePopup";
import ShopInfo from "~/app/user/Restaurant/ShopInfo";
import NotFound from "~/components/NotFound";

import { db, firestore, functions } from "~/plugins/firebase.js";
import { order_status } from "~/plugins/constant.js";

import { ownPlateConfig } from "@/config/project";

export default {
  name: "ShopMenu",

  components: {
    ItemCard,
    PhoneLogin,
    ShopHeader,
    SharePopup,
    ShopInfo,
    NotFound
  },
  head() {
    // TODO: add area to header
    return {
      title:
        Object.keys(this.shopInfo).length == 0
          ? document.title
          : [this.shopInfo.restaurantName || "", ownPlateConfig.restaurantPageTitle || this.defaultTitle].join(
              " / "
            )
    };
  },
  data() {
    return {
      retryCount: 0,
      tabIndex: 0,
      tabs: ["#menus", "#about"],
      loginVisible: false,
      isCheckingOut: false,
      orders: {},
      options: {},
      optionsPrev: {}, // from the store.cart
      restaurantsId: this.restaurantId(),
      shopInfo: {},
      // isCardModalActive: false
      menus: [],
      titles: [],
      waitForUser: false,

      detacher: [],
      notFound: null,

      paymentInfo: {},
      noAvailableTime: false,
    };
  },
  mounted() {
    const index = this.tabs.findIndex(tab => tab === this.$route.hash);
    if (index > -1) {
      this.tabIndex = index;
    }

    // Check if we came here as the result of "Edit Items"
    const url = new URL(window.location.href);
    if (url.hash.length > 1) {
      const prevOrderId = url.hash.slice(1);
      const cart = this.$store.state.carts[prevOrderId] || {};
      //console.log("cart", cart);
      this.orders = cart.orders || {};
      this.optionsPrev = cart.options || {};
    }
  },
  created() {
    const restaurant_detacher = db
      .doc(`restaurants/${this.restaurantId()}`)
      .onSnapshot(async restaurant => {
        const restaurant_data = restaurant.data();
        this.shopInfo = restaurant_data || {};
        if (
          restaurant.exists &&
          !restaurant.data().deletedFlag &&
          restaurant.data().publicFlag
        ) {
          this.notFound = false;
        } else {
          this.notFound = true;
        }
        const shopUid = this.shopInfo.uid;
        const snapshot = await db
          .doc(`/admins/${shopUid}/public/payment`)
          .get();
        this.paymentInfo = snapshot.data() || {};
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
  watch: {
    tabIndex() {
      this.$router.push(this.tabs[this.tabIndex]);
    },
    user(newValue) {
      console.log("user changed");
      if (this.waitForUser && newValue) {
        console.log("handling deferred notification");
        this.goCheckout();
      }
    }
  },
  computed: {
    isPreview() {
      return this.notFound && this.isOwner;
    },
    isOwner() {
      return this.isAdmin && this.uid === this.shopInfo.uid;
    },
    uid() {
      return this.$store.getters.uid;
    },
    totalCount() {
      const ret = Object.keys(this.orders).reduce((total, id) => {
        return total + this.orders[id];
      }, 0);
      return ret;
    },
    itemsObj() {
      return this.array2obj(this.menus.concat(this.titles));
    },
    menuLists() {
      const list = this.shopInfo.menuLists || [];
      return list;
    },
    trimmedOptions() {
      return Object.keys(this.orders).reduce((ret, id) => {
        ret[id] = this.options[id];
        return ret;
      }, {});
    },
    coverImage() {
      return (
        (this.shopInfo?.images?.cover?.resizedImages || {})["1200"] ||
        this.shopInfo.restCoverPhoto
      );
    },
    menuId() {
      return this.$route.params.menuId;
    },
    noPaymentMethod() {
      // MEMO: ignore hidePayment. No longer used
      return !this.paymentInfo.stripe && !this.paymentInfo.inStore;
    }
  },
  methods: {
    handleCheckOut() {
      // The user has clicked the CheckOut button
      this.retryCount = 0;
      if (this.isUser) {
        this.goCheckout();
      } else {
        window.scrollTo(0, 0);
        this.loginVisible = true;
      }
    },
    handleDismissed() {
      // The user has dismissed the login dialog (including the successful login)
      this.loginVisible = false;
      if (this.isUser) {
        this.goCheckout();
      } else {
        console.log("this.user it not ready yet");
        this.waitForUser = true;
        // this.isCheckingOut = false;
      }
    },
    async goCheckout() {
      const order_data = {
        order: this.orders,
        options: this.trimmedOptions,
        status: order_status.new_order,
        uid: this.user.uid,
        phoneNumber: this.user.phoneNumber,
        name: this.user.displayName,
        updatedAt: firestore.FieldValue.serverTimestamp(),
        timeCreated: firestore.FieldValue.serverTimestamp()
        // price never set here.
      };
      this.isCheckingOut = true;
      try {
        if (this.forcedError("checkout")) {
          throw Error("forced Error");
        }
        const res = await db
          .collection(`restaurants/${this.restaurantId()}/orders`)
          .add(order_data);
        // Store the current order associated with this order id, so that we can re-use it
        // when the user clicks the "Edit Items" on the next page.
        // In that case, we will come back here with #id so that we can retrieve it (see mounted).
        this.$store.commit("saveCart", {
          id: res.id,
          cart: {
            orders: this.orders,
            options: this.options
          }
        });
        const wasOrderCreated = functions.httpsCallable("wasOrderCreated2");
        await wasOrderCreated({
          restaurantId: this.restaurantId(),
          orderId: res.id
        });
        this.$router.push({
          path: `/r/${this.restaurantId()}/order/${res.id}`
        });
      } catch (error) {
        if (error.code === "permission-denied" && this.retryCount < 3) {
          this.retryCount++;
          console.log("retrying:", this.retryCount);
          setTimeout(() => {
            this.goCheckout();
          }, 500);
        } else {
          console.error(error.message);
          this.$store.commit("setErrorMessage", {
            code: "order.checkout",
            error
          });
        }
      } finally {
        this.isCheckingOut = false;
      }
    },
    didCountChange(eventArgs) {
      // NOTE: We need to assign a new object to trigger computed properties
      const newObject = { ...this.orders };
      if (eventArgs.count > 0) {
        newObject[eventArgs.id] = eventArgs.count;
      } else {
        delete newObject[eventArgs.id];
      }
      this.orders = newObject;
    },
    didOptionValuesChange(eventArgs) {
      const obj = {};
      obj[eventArgs.id] = eventArgs.optionValues.map((option, index) => {
        if (option === true) {
          if (this.itemsObj[eventArgs.id].itemOptionCheckbox) {
            return this.itemsObj[eventArgs.id].itemOptionCheckbox[index];
          }
        } else if (option === false) {
          return "";
        }
        return option;
      });
      this.options = Object.assign({}, this.options, obj);
      //console.log(this.options);
    }
  }
};
</script>
