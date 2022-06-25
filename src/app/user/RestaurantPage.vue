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
        <RestaurantPreview :isPreview="isPreview" />

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
              <div
                class="mt-2 text-base"
                :class="shopInfo.enablePreline ? 'whitespace-pre-line' : ''"
              >
                {{ shopInfo.introduction }}
              </div>

              <!-- Share and Favorite -->
              <div class="mt-4 flex justify-center items-center space-x-4">
                <!-- Share Popup -->
                <div><share-popup :shopInfo="shopInfo"></share-popup></div>

                <!-- Favorite Button -->
                <div>
                  <favorite-button
                    :shopInfo="shopInfo"
                    :keepLike="false"
                  ></favorite-button>
                </div>
              </div>

              <!-- Restaurant Info -->
              <div class="mt-4">
                <div class="text-xl font-bold text-black text-opacity-30">
                  {{
                    shopInfo.isEC
                      ? $t("shopInfo.ecShopDetails")
                      : $t("shopInfo.restaurantDetails")
                  }}
                </div>

                <div class="mt-2">
                  <shop-info
                    :shopInfo="shopInfo"
                    :paymentInfo="paymentInfo"
                    :isDelivery="isDelivery"
                    @noAvailableTime="noAvailableTime = $event"
                  ></shop-info>
                </div>
              </div>
            </div>
          </div>

          <!-- Right -->
          <div>
            <div class="mx-6 mt-2 lg:mx-0" v-if="shopInfo.enableDelivery">
              <div class="bg-white rounded-lg shadow">
                <div class="p-4">
                  <div class="text-ms font-bold">
                    {{ $t("shopInfo.howToReceive") }}
                  </div>
                  <div>
                    <b-radio
                      name="howtoreceive"
                      v-model="howtoreceive"
                      native-value="takeout"
                    >
                      {{ $t("shopInfo.takeout") }}
                    </b-radio>
                    <b-radio
                      name="howtoreceive"
                      v-model="howtoreceive"
                      native-value="delivery"
                    >
                      {{ $t("shopInfo.delivery") }}
                    </b-radio>
                  </div>
                  <div>
                    <div v-if="deliveryData.enableDeliveryThreshold">
                      {{
                        $tc("shopInfo.deliveryThresholdNotice", 0, {
                          price: deliveryData.deliveryThreshold,
                        })
                      }}
                    </div>
                    <div v-if="deliveryData.deliveryFee > 0">
                      {{
                        $tc("shopInfo.deliveryFeeInfo", 0, {
                          price: deliveryData.deliveryFee,
                        })
                      }}
                      <span v-if="deliveryData.enableDeliveryFree">
                        {{
                          $tc("shopInfo.deliveryFeeThresholdInfo", 0, {
                            price: deliveryData.deliveryFreeThreshold,
                          })
                        }}
                      </span>
                    </div>
                  </div>
                  <div
                    v-if="howtoreceive === 'delivery'"
                    class="mt-2 px-4 py-2 rounded-lg bg-blue-500 bg-opacity-10"
                  >
                    {{ $t("shopInfo.deliveryArea") }}
                    <div v-if="deliveryData.enableAreaMap">
                      {{
                        $tc("shopInfo.deliveryAreaRadius", 0, {
                          radius: deliveryData.radius,
                        })
                      }}
                    </div>
                    <div v-if="deliveryData.enableAreaText">
                      <pre class="bg-transparent p-0">{{
                        deliveryData.areaText
                      }}</pre>
                    </div>
                    {{ $t("shopInfo.deliveryAreaInfo") }}
                  </div>
                </div>
              </div>
            </div>
            <div class="mx-6 mt-2 lg:mx-0">
              <template v-for="(title, key) in titleLists">
                <a
                  :href="`#${title.id}`"
                  class="inline-flex justify-center items-center h-9 rounded-full bg-black bg-opacity-5 mx-2 mt-2"
                >
                  <div class="text-sm font-bold text-op-teal mx-2">
                    {{ title.name }}
                  </div>
                </a>
              </template>
            </div>
            <!-- For Responsible -->
            <div class="mx-6 mt-3 lg:mx-0">
              <!-- Menu Items -->
              <div class="grid grid-col-1 space-y-2">
                <template v-for="(item, key) in itemLists">
                  <div v-if="item._dataType === 'title'" :key="key">
                    <div
                      class="text-xl font-bold text-black text-opacity-30 inline-flex justify-center items-center"
                      :class="key === 0 ? '' : 'mt-6'"
                      :id="item.id"
                      @click="openCategory"
                    >
                      <i class="material-icons mr-2">menu_book</i>
                      <span>
                        {{ item.name }}
                      </span>
                    </div>
                  </div>

                  <div v-if="item._dataType === 'menu'" :key="key">
                    <item-card
                      :item="item"
                      :quantities="orders[item.id] || [0]"
                      :optionPrev="selectedOptionsPrev[item.id]"
                      :initialOpenMenuFlag="(orders[item.id] || []).length > 0"
                      :shopInfo="shopInfo"
                      :isOpen="menuId === item.id"
                      :prices="prices[item.id] || []"
                      @didQuantitiesChange="didQuantitiesChange($event)"
                      @didOptionValuesChange="didOptionValuesChange($event)"
                    ></item-card>
                  </div>
                </template>
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
        :disabled="
          isCheckingOut || noPaymentMethod || noAvailableTime || cantDelivery
        "
        @click="handleCheckOut"
        class="b-reset-tw"
        style="
          width: 18rem;
          position: fixed;
          z-index: 10;
          bottom: 2rem;
          left: 50%;
          margin-left: -9rem;
        "
      >
        <div
          class="inline-flex justify-center items-center w-72 rounded-full bg-op-teal shadow-lg"
          :class="shopInfo.enableDelivery ? 'pt-2 pb-2' : 'h-20'"
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
              <!-- delivery -->
              <template v-if="isDelivery">
                <template
                  v-if="
                    shopInfo.enableDelivery &&
                    cantDelivery &&
                    deliveryData.enableDeliveryThreshold
                  "
                >
                  <div
                    class="inline-flex justify-center items-center text-white text-base font-bold"
                  >
                    {{
                      $tc("shopInfo.buttonDeliveryFeeThreshold", 0, {
                        price: $n(deliveryData.deliveryThreshold, "currency"),
                      })
                    }}
                  </div>
                  <div
                    class="inline-flex justify-center items-center text-white text-base font-bold"
                  >
                    {{
                      $tc("shopInfo.buttonDeliveryFeeDiff", 0, {
                        price: $n(diffDeliveryThreshold, "currency"),
                      })
                    }}
                  </div>
                </template>
                <template
                  v-else-if="deliveryData.enableDeliveryFree && !isDeliveryFree"
                >
                  <div
                    class="inline-flex justify-center items-center text-white text-base font-bold"
                  >
                    {{
                      $tc("shopInfo.deliveryFeeThresholdInfo", 0, {
                        price: $n(
                          deliveryData.deliveryFreeThreshold,
                          "currency"
                        ),
                      })
                    }}
                  </div>
                  <div
                    class="inline-flex justify-center items-center text-white text-base font-bold"
                  >
                    {{
                      $tc("shopInfo.buttonDeliveryFeeDiff", 0, {
                        price: $n(diffDeliveryFreeThreshold, "currency"),
                      })
                    }}
                  </div>
                </template>
                <div
                  class="inline-flex justify-center items-center text-white text-base font-bold"
                  v-if="shopInfo.enableDelivery"
                >
                  <div class="mr-2">
                    {{
                      $tc("shopInfo.buttonDeliveryFee", 0, {
                        price: $n(
                          isDeliveryFree ? 0 : deliveryData.deliveryFee,
                          "currency"
                        ),
                      })
                    }}
                    <span
                      class="text-xs"
                      v-if="!isDeliveryFree && deliveryData.deliveryFee > 0"
                      >{{ $tc("tax.include") }}</span
                    >
                  </div>
                </div>
              </template>
              <!-- total and price -->
              <div
                class="inline-flex justify-center items-center text-white text-base font-bold"
              >
                <div class="mr-2">
                  {{
                    $tc("sitemenu.orderCounter", totalQuantities, {
                      count: totalQuantities,
                    })
                  }}
                </div>
                <div class="">
                  <Price
                    :shopInfo="{ inclusiveTax: true }"
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
            <a
              :href="`#${title.id}`"
              class="inline-flex justify-center items-center h-9 rounded-full bg-black bg-opacity-5 mx-1 mt-2"
            >
              <div class="text-sm font-bold text-op-teal mx-2">
                {{ title.name }}
              </div>
            </a>
          </template>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  watch,
  computed,
  onMounted,
  onUnmounted,
} from "@vue/composition-api";

import ItemCard from "@/app/user/Restaurant/ItemCard";
import PhoneLogin from "@/app/auth/PhoneLogin";
import ShopHeader from "@/app/user/Restaurant/ShopHeader";
import SharePopup from "@/app/user/Restaurant/SharePopup";
import FavoriteButton from "@/app/user/Restaurant/FavoriteButton";
import ShopInfo from "@/app/user/Restaurant/ShopInfo";
import NotFound from "@/components/NotFound";
import Price from "@/components/Price";

import RestaurantPreview from "@/app/user/Restaurant/Preview";

import liff from "@line/liff";
import { db, firestore } from "@/plugins/firebase";
import { wasOrderCreated } from "@/lib/firebase/functions";

import { order_status, mo_prefix } from "@/config/constant";

import { ownPlateConfig } from "@/config/project";
import * as analyticsUtil from "@/lib/firebase/analytics";

import {
  doc2data,
  array2obj,
  arraySum,
  itemOptionCheckbox2options,
  optionPrice,
  isInLiff,
  convOptionArray2Obj,
} from "@/utils/utils";

import { imageUtils } from "@/utils/RestaurantUtils";

export default defineComponent({
  name: "RestaurantPage",

  components: {
    ItemCard,
    PhoneLogin,
    ShopHeader,
    SharePopup,
    FavoriteButton,
    ShopInfo,
    NotFound,
    Price,
    RestaurantPreview,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    paymentInfo: {
      type: Object,
      required: true,
    },
    deliveryData: {
      type: Object,
      required: true,
    },
    notFound: {
      type: Boolean,
      required: false,
    },
    mode: {
      type: String,
      required: false,
    },
  },
  metaInfo() {
    // TODO: add area to header
    return {
      title:
        Object.keys(this.shopInfo).length == 0
          ? document.title
          : [
              this.shopInfo?.restaurantName || "",
              ownPlateConfig.restaurantPageTitle || this.defaultTitle,
            ].join(" / "),
    };
  },
  setup(props, ctx) {
    const retryCount = ref(0);
    const menus = ref([]);
    const titles = ref([]);

    const loginVisible = ref(false);
    const isCheckingOut = ref(false);
    const waitForUser = ref(false);
    const noAvailableTime = ref(false);

    const orders = ref({});
    const selectedOptions = ref({});
    const selectedOptionsPrev = ref({}); // from the store.cart

    const howtoreceive = ref("takeout");
    const store = ctx.root.$store;
    const route = ctx.root.$route
    
    onMounted(() => {
      // Check if we came here as the result of "Edit Items"
      if (store.state.carts[restaurantId.value]) {
        const cart = store.state.carts[restaurantId.value] || {};
        //console.log("cart", cart);
        orders.value = cart.orders || {};
        selectedOptionsPrev.value = cart.options || {};
        selectedOptions.value = cart.options || {};
      }
    });

    const restaurantId = computed(() => {
      return route.params.restaurantId;
    });
    const menuId = computed(() => {
      return route.params.menuId;
    });
    const user = computed(() => {
      return ctx.root.user;
    });
    const uid = computed(() => {
      return store.getters.uid;
    });
    const isAdmin = computed(() => {
      return !!store.getters.uidAdmin;
    });
    const isOwner = computed(() => {
      return isAdmin.value && uid.value === props.shopInfo.uid;
    });
    const isPreview = computed(() => {
      return props.notFound && isOwner.value;
    });

    const menuLists = computed(() => {
      const list = props.shopInfo.menuLists || [];
      return list;
    });
    const isDelivery = computed(() => {
      return howtoreceive.value === "delivery";
    });
    const totalQuantities = computed(() => {
      const ret = Object.values(orders.value).reduce((total, order) => {
        return total + arraySum(order);
      }, 0);
      return ret;
    });

    const coverImage = computed(() => {
      return (
        (props.shopInfo?.images?.cover?.resizedImages || {})["1200"] ||
        props.shopInfo.restCoverPhoto
      );
    });

    const noPaymentMethod = computed(() => {
      // MEMO: ignore hidePayment. No longer used
      return !props.paymentInfo.stripe && !props.paymentInfo.inStore;
    });

    watch(menus, (values) => {
      analyticsUtil.sendMenuListView(
        values,
        props.shopInfo,
        restaurantId.value
      );
    });

    const menu_detacher = db
      .collection(`restaurants/${restaurantId.value}/menus`)
      .where("deletedFlag", "==", false)
      .where("publicFlag", "==", true)
      .onSnapshot((menu) => {
        if (!menu.empty) {
          menus.value = menu.docs
            .filter((a) => {
              const data = a.data();
              return data.validatedFlag === undefined || data.validatedFlag;
            })
            .map(doc2data("menu"));
        }
      });
    const title_detacher = db
      .collection(`restaurants/${restaurantId.value}/titles`)
      .where("deletedFlag", "==", false)
      .onSnapshot((title) => {
        if (!title.empty) {
          titles.value = title.docs.map(doc2data("title"));
        }
      });
    const detacher = [menu_detacher, title_detacher];

    onUnmounted(() => {
      if (detacher) {
        detacher.map((detacher) => {
          detacher();
        });
      }
    });

    const itemsObj = computed(() => {
      return array2obj(menus.value.concat(titles.value));
    });
    const itemLists = computed(() => {
      return menuLists.value
        .map((itemId) => {
          return { ...itemsObj.value[itemId] };
        })
        .filter((item) => {
          return item;
        });
    });
    const titleLists = computed(() => {
      return itemLists.value.filter((item) => {
        return item._dataType === "title" && item.name !== "";
      });
    });

    const totalPrice = computed(() => {
      const subTotal = Object.keys(prices.value).reduce((tmp, menuId) => {
        tmp[menuId] = prices.value[menuId].reduce((a, b) => a + b, 0);
        return tmp;
      }, {});
      const total = Object.keys(subTotal).reduce((tmp, menuId) => {
        const menu = itemsObj.value[menuId] || {};

        if (!props.shopInfo.inclusiveTax) {
          if (menu.tax === "alcohol") {
            return (
              (1 + props.shopInfo.alcoholTax * 0.01) * subTotal[menuId] + tmp
            );
          }
          return (1 + props.shopInfo.foodTax * 0.01) * subTotal[menuId] + tmp;
        } else {
          return tmp + subTotal[menuId];
        }
      }, 0);
      return {
        subTotal: subTotal,
        total: total,
      };
      // total:
    });
    const trimmedSelectedOptions = computed(() => {
      return Object.keys(orders.value).reduce((ret, id) => {
        const options = itemOptionCheckbox2options(
          (itemsObj.value[id] || {}).itemOptionCheckbox
        );
        const selectedOption = selectedOptions.value[id].map((selected) => {
          if (Array.isArray(selected) && selected.length > options.length) {
            const newopt = [...selected];
            return newopt.slice(0, options.length);
          }
          return selected;
        });
        ret[id] = selectedOption;
        return ret;
      }, {});
    });
    const postOptions = computed(() => {
      return Object.keys(trimmedSelectedOptions.value).reduce((ret, id) => {
        ret[id] = (trimmedSelectedOptions.value[id] || []).map((item, k) => {
          return item
            .map((selectedOpt, key) => {
              const opt = (itemsObj.value[id] || {}).itemOptionCheckbox[
                key
              ].split(",");
              if (opt.length === 1) {
                if (selectedOpt) {
                  return opt[0];
                }
              } else {
                return opt[selectedOpt];
              }
              return "";
            })
            .map((s) => s.trim());
        });
        return ret;
      }, {});
    });
    const cantDelivery = computed(() => {
      if (!props.shopInfo.enableDelivery) {
        return false;
      }

      if (isDelivery.value && props.deliveryData.enableDeliveryThreshold) {
        return (
          (totalPrice.value.total || 0) < props.deliveryData.deliveryThreshold
        );
      }
      return false;
    });

    const prices = computed(() => {
      const ret = {};

      const multiple = store.getters.stripeRegion.multiple;
      Object.keys(orders.value).map((menuId) => {
        const menu = itemsObj.value[menuId] || {};
        ret[menuId] = [];
        orders.value[menuId].map((num, orderKey) => {
          const selectedOptionsRaw =
            trimmedSelectedOptions.value[menuId][orderKey] || [];
          const price = selectedOptionsRaw.reduce(
            (tmpPrice, selectedOpt, key) => {
              const opt = (menu.itemOptionCheckbox[key] || "").split(",");
              if (opt.length === 1) {
                if (selectedOpt) {
                  return (
                    tmpPrice +
                    Math.round(optionPrice(opt[0]) * multiple) / multiple
                  );
                }
              } else {
                return (
                  tmpPrice +
                  Math.round(optionPrice(opt[selectedOpt]) * multiple) /
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
      return ret;
    });

    const didQuantitiesChange = (eventArgs) => {
      // NOTE: We need to assign a new object to trigger computed properties
      const newObject = { ...orders.value };
      if (arraySum(eventArgs.quantities) > 0) {
        newObject[eventArgs.id] = eventArgs.quantities;
      } else {
        delete newObject[eventArgs.id];
      }
      orders.value = newObject;
    };
    const didOptionValuesChange = (eventArgs) => {
      selectedOptions.value = Object.assign({}, selectedOptions.value, {
        [eventArgs.id]: eventArgs.optionValues,
      });
    };

    const goCheckout = async () => {
      const name = await (async () => {
        if (ctx.root.isLiffUser) {
          try {
            const user = (await liff.getProfile()) || {};
            return user.displayName;
          } catch (e) {
            return "";
          }
        }
        return user.value.displayName;
      })();

      const order_data = {
        order: orders.value,
        options: convOptionArray2Obj(postOptions.value),
        rawOptions: convOptionArray2Obj(trimmedSelectedOptions.value),
        status: order_status.new_order,
        uid: user.value.uid,
        ownerUid: props.shopInfo.uid,
        isDelivery:
          (props.shopInfo.enableDelivery && isDelivery.value) || false, // true, // for test
        isLiff: ctx.root.isLiffUser,
        phoneNumber: user.value.phoneNumber,
        name: name,
        updatedAt: firestore.FieldValue.serverTimestamp(),
        timeCreated: firestore.FieldValue.serverTimestamp(),
        // price never set here.
      };
      // console.log(order_data);
      isCheckingOut.value = true;
      try {
        if (ctx.root.forcedError("checkout")) {
          throw Error("forced Error");
        }
        const res = await db
          .collection(`restaurants/${restaurantId.value}/orders`)
          .add(order_data);
        // Store the current order associated with this order id, so that we can re-use it
        // when the user clicks the "Edit Items" on the next page.
        // In that case, we will come back here with #id so that we can retrieve it (see mounted).
        store.commit("saveCart", {
          id: restaurantId.value,
          cart: {
            orders: orders.value,
            options: selectedOptions.value,
          },
        });
        await wasOrderCreated({
          restaurantId: restaurantId.value,
          orderId: res.id,
        });

        try {
          const menus = [];
          Object.keys(orders.value).forEach((menuId) => {
            orders.value[menuId].forEach((quantity) => {
              const menu = Object.assign({}, itemsObj.value[menuId]);
              menu.quantity = quantity;
              menus.push(menu);
            });
          });
          analyticsUtil.sendBeginCheckoout(
            totalPrice.value.total,
            menus,
            props.shopInfo,
            restaurantId.value
          );
        } catch (e) {
          console.log(e);
        }
        if (props.mode === "liff") {
          const liffIndexId = route.params.liffIndexId;
          ctx.root.$router.push({
            path: `/liff/${liffIndexId}/r/${restaurantId.value}/order/${res.id}`,
          });
        } else if (props.mode === "mo") {
          ctx.root.$router.push({
            path: `/${mo_prefix}/r/${restaurantId.value}/order/${res.id}`,
          });
        } else {
          ctx.root.$router.push({
            path: `/r/${restaurantId.value}/order/${res.id}`,
          });
        }
      } catch (error) {
        if (error.code === "permission-denied" && retryCount.value < 3) {
          retryCount.value++;
          console.log("retrying:", retryCount.value);
          setTimeout(() => {
            goCheckout();
          }, 500);
        } else {
          console.error(error.message);
          store.commit("setErrorMessage", {
            code: "order.checkout",
            error,
          });
        }
      } finally {
        isCheckingOut.value = false;
      }
    };
    const handleCheckOut = () => {
      // The user has clicked the CheckOut button
      retryCount.value = 0;

      if (ctx.root.isUser || ctx.root.isLiffUser) {
        goCheckout();
      } else {
        window.scrollTo(0, 0);
        loginVisible.value = true;
      }
    };
    const handleDismissed = () => {
      // The user has dismissed the login dialog (including the successful login)
      loginVisible.value = false;
      if (ctx.root.isUser || ctx.root.isLiffUser) {
        goCheckout();
      } else {
        console.log("this.user it not ready yet");
        waitForUser.value = true;
      }
    };

    const diffDeliveryThreshold = computed(() => {
      return (
        props.deliveryData.deliveryThreshold - (totalPrice.value.total || 0)
      );
    });
    const diffDeliveryFreeThreshold = computed(() => {
      return (
        props.deliveryData.deliveryFreeThreshold - (totalPrice.value.total || 0)
      );
    });
    const isDeliveryFree = computed(() => {
      if (
        props.shopInfo.enableDelivery &&
        props.deliveryData.enableDeliveryFree
      ) {
        return (
          (totalPrice.value.total || 0) >=
          props.deliveryData.deliveryFreeThreshold
        );
      }
      return false;
    });

    watch(user, (newValue) => {
      console.log("user changed");
      if (waitForUser.value && newValue) {
        console.log("handling deferred notification");
        goCheckout();
      }
    });

    return {
      menus,
      titles,
      itemsObj,

      itemLists,
      titleLists,

      coverImage,
      menuId,

      isOwner,
      isDelivery,
      howtoreceive,

      orders,

      totalQuantities,
      selectedOptionsPrev,

      totalPrice,
      prices,

      isPreview,
      cantDelivery,
      noPaymentMethod,

      didQuantitiesChange,
      didOptionValuesChange,

      handleCheckOut,
      handleDismissed,

      loginVisible,
      isCheckingOut,
      noAvailableTime,

      ...imageUtils(),
    };
  },
});
</script>
