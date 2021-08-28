<template>
  <div>
    <template v-if="notFound == null"></template>
    <template v-else-if="notFound && !isOwner">
      <not-found />
    </template>
    <template v-else>
      <!-- Restaurant Page -->
      <div>
        <!-- For Owner Preview Only -->
        <div v-if="isPreview" class="bg-red-700 bg-opacity-10 text-center p-4">
          <div class="text-base font-bold text-red-700">
            {{ $t("shopInfo.thisIsPreview") }}
          </div>
          <div class="text-base font-bold text-red-700">
            {{ $t("shopInfo.notPublic") }}
          </div>
        </div>

        <!-- Body -->
        <div class="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12 lg:mx-6">
          <!-- Left -->
          <div>
            <!-- Cover Image -->
            <div class="lg:mt-6">
              <img
                @click.stop="openImage()"
                :src="coverImage"
                class="h-48 w-full object-cover lg:rounded-lg"
              />
            </div>

            <!-- For Responsible  -->
            <div class="mx-6 lg:mx-0">
              <!-- Restaurant Profile Photo and Name -->
              <div class="mt-4">
                <shop-header :shopInfo="shopInfo"></shop-header>
              </div>

              <!-- Restaurant Descriptions -->
              <div class="mt-2 text-base">
                {{ this.shopInfo.introduction }}
              </div>

              <!-- Share and Favorite -->
              <div class="mt-4 flex justify-center items-center space-x-4">
                <!-- Share Popup -->
                <div><share-popup :shopInfo="shopInfo"></share-popup></div>

                <!-- Favorite Button -->
                <div>
                  <favorite-button :shopInfo="shopInfo" :keepLike="false"></favorite-button>
                </div>
              </div>

              <!-- Restaurant Info -->
              <div class="mt-4">
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

          <!-- Right -->
          <div>
            <div class="mx-6 mt-6 lg:mx-0">
              <template v-for="(title, key) in titleLists">
                <a :href="`#${title.id}`"
                   class="inline-flex justify-center items-center h-9 m-1 rounded-full bg-black bg-opacity-5"
                   >
                  <div class="text-sm font-bold text-op-teal">
                    {{title.name}}
                  </div>
                </a>
              </template>
            </div>
            <!-- For Responsible -->
            <div class="mx-6 mt-6 lg:mx-0">
              <!-- Menu Items -->
              <div class="grid grid-col-1 space-y-2">
                <div v-for="(item, key) in itemLists" :key="key">
                  <div
                    v-if="item._dataType === 'title'"
                    class="text-xl font-bold text-black text-opacity-30"
                    :class="key === 0 ? '' : 'mt-6'"
                    :id="item.id"
                    >
                    {{ item.name }}
                    <span @click="openCategory">
                      {{ $t("shopInfo.category") }}
                    </span>
                  </div>

                  <item-card
                    v-if="item._dataType === 'menu'"
                    :item="item"
                    :quantities="orders[item.id] || [0]"
                    :optionPrev="optionsPrev[item.id]"
                    :initialOpenMenuFlag="(orders[item.id] || []).length > 0"
                    :shopInfo="shopInfo"
                    :isOpen="menuId === item.id"
                    :prices="prices[item.id] || []"
                    @didQuantitiesChange="didQuantitiesChange($event)"
                    @didOptionValuesChange="didOptionValuesChange($event)"
                    ></item-card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Phone Login-->
      <b-modal :active.sync="loginVisible" :width="488" scroll="keep">
        <div class="mx-2 my-6 p-6 bg-white shadow-lg rounded-lg">
          <phone-login v-on:dismissed="handleDismissed" />
        </div>
      </b-modal>

      <!-- Cart Button -->
      <div v-if="isCheckingOut" class="fixed top-0 left-0 w-full h-full"></div>
      <b-button
        v-if="0 != totalQuantities"
        :loading="isCheckingOut"
        :disabled="isCheckingOut || noPaymentMethod || noAvailableTime"
        @click="handleCheckOut"
        class="b-reset-tw"
        style="width: 18rem; position: fixed; z-index: 10; bottom: 2rem; left: 50%; margin-left: -9rem;"
      >
        <div
          class="inline-flex justify-center items-center h-20 w-72 rounded-full bg-op-teal shadow-lg"
        >
          <template v-if="noPaymentMethod">
            <div class="text-white text-base font-bold">
              {{ $t("shopInfo.noPaymentMethod") }}
            </div>
          </template>

          <template v-else-if="noAvailableTime">
            <div class="text-white text-base font-bold">
              {{ $t("shopInfo.noAvailableTime") }}
            </div>
          </template>

          <template v-else="!noPaymentMethod">
            <div class="inline-flex flex-col justify-center items-center">
              <div
                class="inline-flex justify-center items-center text-white text-base font-bold"
              >
                <div class="mr-2">
                  {{
                    $tc("sitemenu.orderCounter", totalQuantities, {
                      count: totalQuantities
                    })
                  }}
                </div>
                <div class="">
                  <Price
                    :shopInfo="{inclusiveTax: true}"
                    :menu="{ price: totalPrice.total }"
                  />
                </div>
              </div>

              <div
                class="is-inline-flex flex-center justify-center items-center text-white"
              >
                <div class="text-xl font-bold mr-2">
                  {{ $t("sitemenu.checkout") }}
                </div>
                <i class="material-icons text-2xl">shopping_cart</i>
              </div>
            </div>
          </template>
        </div>
      </b-button>
    </template>
    <!-- Image Popup-->
    <b-modal :active.sync="imagePopup" :width="488" scroll="keep">
      <div class="px-2 text-center" @click.stop="closeImage()">
        <img :src="coverImage" class="rounded-lg shadow-lg" />
      </div>
    </b-modal>
    <!-- Image Popup-->
    <b-modal :active.sync="categoryPopup" :width="488" scroll="keep">
      <div class="px-2 text-center" @click.stop="closeCategory()">
        <div class="mx-2 my-6 p-6 bg-white shadow-lg rounded-lg">
          <template v-for="(title, key) in titleLists">
            <a :href="`#${title.id}`"
               class="inline-flex justify-center items-center h-9 m-1 rounded-full bg-black bg-opacity-5"
               >
              <div class="text-sm font-bold text-op-teal">
                {{title.name}}
              </div>
            </a>
          </template>
        </div>
      </div>
    </b-modal>
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

import { db, firestore, functions } from "~/plugins/firebase.js";
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

      imagePopup: false,
      categoryPopup: false,

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
      .where("deletedFlag", "==", false)
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
        const menu = this.itemsObj[menuId];

        if (!this.shopInfo.inclusiveTax) {
          if (menu.tax === "alcohol") {
            return (1 + this.shopInfo.alcoholTax * 0.01) * subTotal[menuId] + tmp;
          }
          return (1 + this.shopInfo.foodTax * 0.01) * subTotal[menuId] + tmp;
        } else {
          return tmp + subTotal[menuId];
        }
      }, 0);
      return {
        subTotal: subTotal,
        total: total
      };
      // total:
    },
    prices() {
      const ret = {};

      const multiple = this.regionMultiple;
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
      // console.log(ret);
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
    itemLists() {
      return this.menuLists.map((itemId) => {
        return this.itemsObj[itemId];
      }).filter((item) => {
        return item;
      });
    },
    titleLists() {
      return this.itemLists.filter((item) => {
        return item._dataType === "title"
      });
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
    openImage() {
      this.imagePopup = true;
    },
    closeImage() {
      this.imagePopup = false;
    },
    openCategory() {
      this.categoryPopup = true;
    },
    closeCategory() {
      this.categoryPopup = false;
    },

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
        ownerUid: this.shopInfo.uid,
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

        try {
          const menus = [];
          Object.keys(this.orders).forEach((menuId) => {
            this.orders[menuId].forEach(quantity => {
              const menu = Object.assign({}, this.itemsObj[menuId]);
              menu.quantity = quantity;
              menus.push(menu);
            });
          });
          analyticsUtil.sendBeginCheckoout(
            this.totalPrice.total,
            menus,
            this.shopInfo,
            this.restaurantId()
          );
        } catch (e) {
          console.log(e);
        }
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
