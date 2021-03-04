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
          <div class="column is-narrow w-6"></div>
          <!-- Center Column -->
          <div class="column">
            <div
              class="bg-status-red-bg rounded-lg p-l-16 p-r-16 p-t-16 p-b-16 align-center m-l-24 m-r-24 m-t-24"
            >
              <div class="t-subtitle1 c-status-red">
                {{ $t("shopInfo.thisIsPreview") }}
              </div>
              <div class="t-subtitle1 c-status-red">
                {{ $t("shopInfo.notPublic") }}
              </div>
            </div>
            <div class="is-hidden-tablet h-6"></div>
          </div>
          <!-- Right Gap -->
          <div class="column is-narrow w-6"></div>
        </div>

        <!-- Restaurant Body Area -->
        <div class="columns is-gapless">
          <!-- Left Gap -->
          <div class="column is-narrow w-6"></div>

          <!-- Left Column -->
          <div class="column">
            <!-- Restaurant Cover Photo -->
            <div class="columns is-gapless">
              <div class="column is-narrow w-6"></div>
              <div class="column">
                <div class="is-hidden-mobile h-6"></div>
                <div class="bg-form h-48">
                  <img
                    :src="coverImage"
                    class="h-48 w-full cover is-hidden-tablet"
                  />
                  <img
                    :src="coverImage"
                    class="h-48 w-full cover rounded-lg is-hidden-mobile"
                  />
                </div>
              </div>
              <div class="column is-narrow w-6"></div>
            </div>

            <!-- Restaurant Details -->
            <div class="m-l-24 m-r-24">
              <!-- Restaurant Profile Photo and Name -->
              <shop-header :shopInfo="shopInfo"></shop-header>

              <!-- Restaurant Descriptions -->
              <div class="t-body1 c-text-black-medium m-t-8">
                {{ this.shopInfo.introduction }}
              </div>

              <!-- Share and Favorite -->
              <div class="align-center">
                <!-- Share Popup -->
                <share-popup :shopInfo="shopInfo"></share-popup>

                <!-- Favorite Button -->
                <favorite-button :shopInfo="shopInfo"></favorite-button>
              </div>

              <!-- Restaurant Info -->
              <div>
                <div class="text-xl font-bold text-black text-opacity-30">
                  {{ $t("shopInfo.restaurantDetails") }}
                </div>

                <div class="mt-2">
                  <shop-info
                    :shopInfo="shopInfo"
                    :paymentInfo="paymentInfo"
                    @noAvailableTime="noAvailableTime = $event"
                  ></shop-info>
                </div>
              </div>
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
                    >
                      {{ itemsObj[itemId].name }}
                    </div>
                    <item-card
                      v-if="itemsObj[itemId]._dataType === 'menu'"
                      :item="itemsObj[itemId]"
                      :quantities="orders[itemId] || [0]"
                      :optionPrev="optionsPrev[itemId]"
                      :initialOpenMenuFlag="(orders[itemId] || []).length > 0"
                      :shopInfo="shopInfo"
                      :isOpen="menuId === itemId"
                      :prices="prices[itemId] || []"
                      @didQuantitiesChange="didQuantitiesChange($event)"
                      @didOptionValuesChange="didOptionValuesChange($event)"
                    ></item-card>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <!-- Right Gap -->
          <div class="column is-narrow w-6"></div>
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
        v-if="0 != totalQuantities"
        :loading="isCheckingOut"
        :disabled="isCheckingOut || noPaymentMethod || noAvailableTime"
        @click="handleCheckOut"
      >
        <div class="is-flex flex-center">
          <template v-if="noPaymentMethod">
            <div class="flex-1 align-center c-onprimary">
              {{ $t("shopInfo.noPaymentMethod") }}
            </div>
          </template>
          <template v-else-if="noAvailableTime">
            <div class="flex-1 align-center c-onprimary">
              {{ $t("shopInfo.noAvailableTime") }}
            </div>
          </template>
          <template v-else="!noPaymentMethod">
            <div>
              <div class="level is-mobile t-subtitle1 c-text-white-full">
                <div class="level-left">
                  {{
                    $tc("sitemenu.orderCounter", totalQuantities, {
                      count: totalQuantities
                    })
                  }}
                </div>
                <div class="level-right m-l-8">
                  <Price
                    :shopInfo="shopInfo"
                    :menu="{ price: totalPrice.total }"
                  />
                </div>
              </div>

              <div class="is-inline-flex flex-center m-t-4">
                <div class="m-r-8 c-onprimary">
                  {{ $t("sitemenu.checkout") }}
                </div>
                <i class="material-icons c-onprimary">shopping_cart</i>
              </div>
            </div>
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
import FavoriteButton from "~/app/user/Restaurant/FavoriteButton";
import ShopInfo from "~/app/user/Restaurant/ShopInfo";
import NotFound from "~/components/NotFound";
import Price from "~/components/Price";

import { db, firestore, functions, analytics } from "~/plugins/firebase.js";
import { order_status } from "~/plugins/constant.js";

import { ownPlateConfig } from "@/config/project";
import * as analyticsUtil from "~/plugins/analytics";

export default {
  name: "ShopMenu",

  components: {
    ItemCard,
    PhoneLogin,
    ShopHeader,
    SharePopup,
    FavoriteButton,
    ShopInfo,
    NotFound,
    Price
  },
  head() {
    // TODO: add area to header
    return {
      title:
        Object.keys(this.shopInfo).length == 0
          ? document.title
          : [
              this.shopInfo.restaurantName || "",
              ownPlateConfig.restaurantPageTitle || this.defaultTitle
            ].join(" / ")
    };
  },
  data() {
    return {
      retryCount: 0,
      loginVisible: false,
      isCheckingOut: false,
      orders: {},
      options: {},
      optionsPrev: {}, // from the store.cart
      restaurantsId: this.restaurantId(),
      shopInfo: {},
      menus: [],
      titles: [],
      waitForUser: false,

      detacher: [],
      notFound: null,

      paymentInfo: {},
      noAvailableTime: false
    };
  },
  mounted() {
    // Check if we came here as the result of "Edit Items"
    if (this.$store.state.carts[this.restaurantId()]) {
      const cart = this.$store.state.carts[this.restaurantId()] || {};
      //console.log("cart", cart);
      this.orders = cart.orders || {};
      this.optionsPrev = cart.options || {};
      this.options = cart.options || {};
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
    user(newValue) {
      console.log("user changed");
      if (this.waitForUser && newValue) {
        console.log("handling deferred notification");
        this.goCheckout();
      }
    },
    menus(values) {
      analyticsUtil.sendMenuListView(
        values,
        this.shopInfo,
        this.restaurantId()
      );
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
    totalPrice() {
      const subTotal = Object.keys(this.prices).reduce((tmp, menuId) => {
        tmp[menuId] = this.prices[menuId].reduce((a, b) => a + b, 0);
        return tmp;
      }, {});
      const total = Object.keys(subTotal).reduce((tmp, menuId) => {
        return tmp + subTotal[menuId];
      }, 0);
      return {
        subTotal: subTotal,
        total: total
      };
      // total:
    },
    prices() {
      const ret = {};

      const multiple = this.$store.getters.stripeRegion.multiple;
      Object.keys(this.orders).map(menuId => {
        const menu = this.itemsObj[menuId];
        ret[menuId] = [];
        this.orders[menuId].map((num, orderKey) => {
          const selectedOptionsRaw = this.trimmedSelectedOptions[menuId][
            orderKey
          ];
          const price = selectedOptionsRaw.reduce(
            (tmpPrice, selectedOpt, key) => {
              const opt = menu.itemOptionCheckbox[key].split(",");
              if (opt.length === 1) {
                if (selectedOpt) {
                  return (
                    tmpPrice +
                    Math.round(this.optionPrice(opt[0]) * multiple) / multiple
                  );
                }
              } else {
                return (
                  tmpPrice +
                  Math.round(this.optionPrice(opt[selectedOpt]) * multiple) /
                    multiple
                );
              }
              return tmpPrice;
            },
            menu.price
          );
          ret[menuId].push(price * num);
        });
      });
      console.log(ret);
      return ret;
    },
    totalQuantities() {
      const ret = Object.values(this.orders).reduce((total, order) => {
        return total + this.arraySum(order);
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
    trimmedSelectedOptions() {
      return Object.keys(this.orders).reduce((ret, id) => {
        ret[id] = this.options[id];
        return ret;
      }, {});
    },
    postOptions() {
      return Object.keys(this.trimmedSelectedOptions).reduce((ret, id) => {
        ret[id] = (this.trimmedSelectedOptions[id] || []).map((item, k) => {
          return item
            .map((selectedOpt, key) => {
              const opt = this.itemsObj[id].itemOptionCheckbox[key].split(",");
              if (opt.length === 1) {
                if (selectedOpt) {
                  return opt[0];
                }
              } else {
                return opt[selectedOpt];
              }
              return "";
            })
            .map(s => s.trim());
        });
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
    optionPrice(option) {
      const regex = /\(((\+|\-|＋|ー|−)[0-9\.]+)\)/;
      const match = option.match(regex);
      if (match) {
        return Number(match[1].replace(/ー|−/g, "-").replace(/＋/g, "+"));
      }
      return 0;
    },
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
    convOptionArray2Obj(obj) {
      return Object.keys(obj).reduce((newObj, objKey) => {
        newObj[objKey] = obj[objKey].reduce((tmp, value, key) => {
          tmp[key] = value;
          return tmp;
        }, {});
        return newObj;
      }, {});
    },
    async goCheckout() {
      const order_data = {
        order: this.orders,
        options: this.convOptionArray2Obj(this.postOptions),
        rawOptions: this.convOptionArray2Obj(this.trimmedSelectedOptions),
        status: order_status.new_order,
        uid: this.user.uid,
        phoneNumber: this.user.phoneNumber,
        name: this.user.displayName,
        updatedAt: firestore.FieldValue.serverTimestamp(),
        timeCreated: firestore.FieldValue.serverTimestamp()
        // price never set here.
      };
      // console.log(order_data);
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
          id: this.restaurantId(),
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
    didQuantitiesChange(eventArgs) {
      // NOTE: We need to assign a new object to trigger computed properties
      const newObject = { ...this.orders };
      if (this.arraySum(eventArgs.quantities) > 0) {
        newObject[eventArgs.id] = eventArgs.quantities;
      } else {
        delete newObject[eventArgs.id];
      }
      this.orders = newObject;
    },
    didOptionValuesChange(eventArgs) {
      this.options = Object.assign({}, this.options, {
        [eventArgs.id]: eventArgs.optionValues
      });
      //console.log(this.options);
    }
  }
};
</script>
