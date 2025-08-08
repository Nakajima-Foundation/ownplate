<template>
  <div>
    <template v-if="notFound == null"></template>
    <template v-else-if="notFound && !isOwner && !isSubAccount">
      <not-found />
    </template>
    <template v-else>
      <div
        v-if="
          totalQuantities === 0 && promotion && promotion.type === 'discount'
        "
      >
        <FloatingBanner
          :promotion="promotion"
          :possiblePromotions="possiblePromotions"
        />
      </div>

      <!-- Restaurant Page -->
      <div>
        <!-- For Owner Preview Only -->
        <RestaurantPreview :isPreview="isPreview" />

        <!-- Body -->
        <div class="grid grid-cols-1 lg:mx-6 lg:grid-cols-2 lg:gap-x-12">
          <!-- Left -->
          <div id="RestaurantLeftTop">
            <!-- Cover Image -->
            <div class="cursor-pointer lg:mt-2">
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
                <ShopHeader :shopInfo="shopInfo"></ShopHeader>
              </div>

              <!-- Restaurant Descriptions -->
              <div
                class="mt-2 text-base"
                :class="shopInfo.enablePreline ? 'whitespace-pre-line' : ''"
              >
                {{ shopInfo.introduction }}
              </div>

              <!-- Share and Favorite -->
              <div class="mt-4 flex items-center justify-center space-x-4">
                <!-- Share Popup -->
                <div>
                  <share-popup :shopInfo="shopInfo" :mode="mode"></share-popup>
                </div>

                <!-- Favorite Button -->
                <div>
                  <favorite-button :shopInfo="shopInfo"></favorite-button>
                </div>
              </div>

              <!-- Restaurant Info -->
              <div class="mt-4" v-if="!isTransactionAct">
                <div class="text-xl font-bold text-black/30">
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
          <div v-if="isTransactionAct">
            <div class="mx-6 mt-2 lg:mx-0">
              <TransactionsActContents
                :shopInfo="shopInfo"
                :isDelivery="isDelivery"
                @closeTransactionsAct="closeTransactionsAct"
                closeButton="button.back"
              />
            </div>
          </div>
          <div v-else>
            <div class="mx-6 mt-2 lg:mx-0" v-if="shopInfo.enableDelivery">
              <div class="rounded-lg bg-white shadow-sm">
                <!-- delivery toggle-->
                <Delivery
                  :shopInfo="shopInfo"
                  :deliveryData="deliveryData"
                  v-model="howtoreceive"
                />
                <!-- delivery -->
              </div>
            </div>

            <!-- titles for omochikaeri -->
            <Titles :titleLists="titleLists" v-if="titleLists.length > 0" />

            <!-- Lunch/Dinner -->
            <div class="mx-6 mt-4 lg:mx-0" v-if="shopInfo.enableLunchDinner">
              <div class="rounded-lg bg-white shadow-sm">
                <LunchDinner
                  :shopInfo="shopInfo"
                  v-model="lunchOrDinner"
                  :hasDinnerOnlyOrder="hasDinnerOnlyOrder"
                  :hasLunchOnlyOrder="hasLunchOnlyOrder"
                />
              </div>
            </div>

            <!-- For Responsible -->
            <div class="mx-6 mt-2 lg:mx-0">
              <div class="grid-col-1 grid space-y-2">
                <template v-for="(item, key) in itemLists">
                  <!-- Title -->
                  <div v-if="item._dataType === 'title'" :key="key">
                    <div
                      class="inline-flex cursor-pointer items-center justify-center text-xl font-bold text-black/30"
                      :class="key === 0 ? '' : 'mt-2'"
                      :id="item.id"
                      @click="openCategory"
                    >
                      <i class="material-icons mr-2">menu_book</i>
                      <span>
                        {{ item.name }}
                      </span>
                    </div>
                  </div>

                  <!-- Menu -->
                  <div v-if="item._dataType === 'menu'" :key="item.id">
                    <RestaurantMenu
                      :key="['item', item.id].join('_')"
                      :item="item"
                      :menuPickupData="menuPickupData[item.id] || {}"
                      :quantities="orders[item.id] || [0]"
                      :selectedOptions="selectedOptions[item.id]"
                      :initialOpenMenuFlag="(orders[item.id] || []).length > 0"
                      :shopInfo="shopInfo"
                      :isOpen="menuId === item.id"
                      :prices="prices[item.id] || []"
                      :mode="mode"
                      @didOrderdChange="didOrderdChange($event)"
                      @updateSelectedOptions="
                        updateSelectedOptions(item.id, $event)
                      "
                    ></RestaurantMenu>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div class="mx-6 mt-8" v-if="!isTransactionAct">
          <div class="rounded-lg bg-white shadow-sm">
            <router-link :to="pageBase + '/transactions-act'">
              <div
                class="inline-flex items-center justify-center p-4"
                @click="scrollTop"
              >
                <i class="material-icons text-op-teal mr-2 text-lg"
                  >account_balance</i
                >
                <div class="text-op-teal text-sm font-bold">
                  {{ $t("transactionsAct.title") }}
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Phone Login-->
      <t-modal v-model:active="loginVisible" width="488" scroll="keep">
        <div class="mx-2 my-6 rounded-lg bg-white p-6 shadow-lg">
          <phone-login v-on:dismissed="handleDismissed" />
        </div>
      </t-modal>
      <Cart
        v-if="isShowCart"
        @closeCart="closeCart"
        :orders="orders"
        :selectedOptions="selectedOptions"
        :menuObj="cartItems"
        :prices="prices"
        :shopInfo="shopInfo"
        @didOrderdChange="didOrderdChange"
        :totalPrice="totalPrice"
        :promotions="promotions"
        :possiblePromotions="possiblePromotions"
        :lunchOrDinner="lunchOrDinner"
      />

      <!-- for disable all UI -->
      <div v-if="isCheckingOut" class="fixed top-0 left-0 h-full w-full"></div>
      <!-- Cart Button -->
      <CartButton
        ref="cartButton"
        @handleCheckOut="handleCheckOut"
        :shopInfo="shopInfo"
        :orders="orders"
        :paymentInfo="paymentInfo"
        :deliveryData="deliveryData"
        :isCheckingOut="isCheckingOut"
        :isDelivery="isDelivery"
        :noAvailableTime="noAvailableTime"
        :totalPrice="totalPrice"
      />
    </template>
    <!-- Image Popup-->
    <t-modal
      v-model:active="imagePopup"
      width="488"
      scroll="keep"
      @dismissed="imagePopup = false"
    >
      <div class="px-2 text-center" @click.stop="closeImage()">
        <img :src="coverImage" class="rounded-lg shadow-lg" />
      </div>
    </t-modal>
    <!-- Image Popup ??-->
    <t-modal
      v-model:active="categoryPopup"
      width="488"
      scroll="keep"
      @dismissed="categoryPopup = false"
    >
      <div class="px-2 text-center">
        <div class="mx-2 my-6 rounded-lg bg-white p-6 shadow-lg">
          <div class="font-bold">{{ $t("order.category") }}</div>
          <template v-for="(title, key) in titleLists" :key="key">
            <a
              :href="`#${title.id}`"
              class="mx-1 mt-2 inline-flex h-9 items-center justify-center rounded-full bg-black/5"
              @click="closeCategory"
            >
              <div class="text-op-teal mx-2 text-sm font-bold">
                {{ title.name }}
              </div>
            </a>
          </template>
        </div>
      </div>
    </t-modal>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  watch,
  computed,
  onBeforeMount,
  onUnmounted,
  PropType,
} from "vue";

import RestaurantMenu from "@/app/user/Restaurant/Menu.vue";
import PhoneLogin from "@/app/auth/PhoneLogin.vue";
import ShopHeader from "@/app/user/Restaurant/ShopHeader.vue";
import SharePopup from "@/app/user/Restaurant/SharePopup.vue";
import FavoriteButton from "@/app/user/Restaurant/FavoriteButton.vue";
import ShopInfo from "@/app/user/Restaurant/ShopInfo.vue";
import NotFound from "@/components/NotFound.vue";

import RestaurantPreview from "@/app/user/Restaurant/Preview.vue";
import CartButton from "@/app/user/Restaurant/CartButton.vue";
import Cart from "@/app/user/Restaurant/Cart.vue";
import Delivery from "@/app/user/Restaurant/Delivery.vue";
import LunchDinner from "@/app/user/Restaurant/LunchDinner.vue";
import Titles from "@/app/user/Restaurant/Titles.vue";
import TransactionsActContents from "@/app/user/TransactionsAct/Contents.vue";

import FloatingBanner from "@/app/user/Restaurant/FloatingBanner.vue";

import { usePickupTime } from "@/utils/pickup";

import liff from "@line/liff";
import { db } from "@/lib/firebase/firebase9";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { orderCreated } from "@/lib/firebase/functions";

import { order_status } from "@/config/constant";

import { ownPlateConfig } from "@/config/project";
import * as analyticsUtil from "@/lib/firebase/analytics";

import { RestaurantInfoData } from "@/models/RestaurantInfo";
import {
  MenuData,
  TitleData,
  isAvailableLunchOrDinner,
  onlyLunchOrDinner,
} from "@/models/menu";
import { AnalyticsMenuData } from "@/lib/firebase/analytics";
import Promotion from "@/models/promotion";

import { useHead } from "@unhead/vue";

import {
  array2obj,
  arraySum,
  convOptionArray2Obj,
  prices2subtotal,
  subtotal2total,
  getPrices,
  getTrimmedSelectedOptions,
  getPostOption,
  // useToggle,
  scrollToElementById,
  useUserData,
  useBasePath,
  defaultTitle,
  stripeRegion
} from "@/utils/utils";

import { imageUtils } from "@/utils/RestaurantUtils";

import { useTitles, useMenu } from "./Restaurant/Utils";

import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";

import {
  OrderDataType,
  CartItemsType,
  CartOptionType,
} from "@/models/cartType";

export default defineComponent({
  name: "RestaurantPage",

  components: {
    RestaurantMenu,
    PhoneLogin,
    ShopHeader,
    SharePopup,
    FavoriteButton,
    ShopInfo,
    NotFound,
    RestaurantPreview,
    CartButton,
    Cart,
    Delivery,
    LunchDinner,
    TransactionsActContents,
    Titles,
    FloatingBanner,
  },
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
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
    promotions: {
      type: Array<Promotion>,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    const retryCount = ref(0);

    const loginVisible = ref(false);
    const isCheckingOut = ref(false);
    const waitForUser = ref(false);
    const noAvailableTime = ref(false);

    const orders = ref<OrderDataType>({});
    const cartItems = ref<CartItemsType>({});
    const selectedOptions = ref<CartOptionType>({});

    const multiple = stripeRegion.multiple;
    
    const basePath = useBasePath();

    useHead(() => ({
      title:
        Object.keys(props.shopInfo).length === 0
          ? document.title
          : [
              props.shopInfo?.restaurantName || "",
              ownPlateConfig.restaurantPageTitle || defaultTitle,
            ].join(" / "),
    }));

    const defaultHowToReceive = (() => {
      // for 333
      const rId = route.params.restaurantId as string;
      if (store.state.carts[rId]) {
        const cart = store.state.carts[rId] || {};
        if (cart.howtoreceive) {
          return cart.howtoreceive;
        }
      }
      if (props.shopInfo.deliveryOnlyStore) {
        return "delivery";
      }
      return "takeout";
    })();
    const howtoreceive = ref(defaultHowToReceive);

    const lunchOrDinner = ref("lunch");

    const restaurantId = computed(() => {
      return route.params.restaurantId as string;
    });
    const menuId = computed(() => {
      return route.params.menuId;
    });

    const { user, uid, isAdmin, isUser, isLiffUser } = useUserData();
    const isOwner = computed(() => {
      return isAdmin.value && uid.value === props.shopInfo.uid;
    });
    const isSubAccount = computed(() => {
      return (
        isAdmin.value && store.state?.claims?.parentUid === props.shopInfo.uid
      );
    });
    const isPreview = computed(() => {
      return props.notFound && isOwner.value;
    });

    const isDelivery = computed(() => {
      return howtoreceive.value === "delivery";
    });

    const coverImage = computed(() => {
      return (
        (props.shopInfo?.images?.cover?.resizedImages || {})["1200"] ||
        props.shopInfo.restCoverPhoto
      );
    });

    const { loadMenu, setCache, menus, menuObj, menuCache } =
      useMenu(restaurantId);

    const { menuPickupData } = usePickupTime(props.shopInfo, {}, menuObj);

    // changed from onMount
    // avoid to reset cart when pickup or other not takeout
    onBeforeMount(() => {
      // Check if we came here as the result of "Edit Items"
      if (store.state.carts[restaurantId.value]) {
        const cart = store.state.carts[restaurantId.value] || {};
        orders.value = cart.orders || {};
        cartItems.value = cart.cartItems || {};
        selectedOptions.value = cart.options || {};
        lunchOrDinner.value = cart.lunchOrDinner || "lunch";
        setCache(cart.menuCache);
        if (cart.howtoreceive) {
          howtoreceive.value = cart.howtoreceive;
        }
      }
    });

    loadMenu(() => {
      if (location.hash && location.hash[0] === "#") {
        const id = location.hash.slice(1);
        setTimeout(() => {
          scrollToElementById(id);
        }, 400);
      }
    });

    watch(menus, (values) => {
      analyticsUtil.sendMenuListView(
        values as AnalyticsMenuData[],
        props.shopInfo,
        restaurantId.value,
      );
    });

    const { loadTitle, titles } = useTitles(restaurantId);
    loadTitle();

    const lunchOrDinnerFilter = (item: MenuData | TitleData) => {
      if (props.shopInfo.enableLunchDinner) {
        const { availableLunch, availableDinner } =
          isAvailableLunchOrDinner(item);
        if (lunchOrDinner.value === "lunch") {
          return availableLunch;
        }
        if (lunchOrDinner.value === "dinner") {
          return availableDinner;
        }
      }
      return true;
    };

    const itemLists = computed(() => {
      const menuLists = props.shopInfo.menuLists || [];

      const itemsObj = array2obj(
        ([] as (MenuData | TitleData)[])
          .concat(menus.value)
          .concat(titles.value),
      );
      return menuLists
        .map((itemId) => {
          return { ...itemsObj[itemId] };
        })
        .filter(lunchOrDinnerFilter)
        .filter((item) => {
          return !(item._dataType === "title" && item.name === "");
        });
    });
    // lunch or dinner
    const hasDinnerOnlyOrder = computed(() => {
      return Object.keys(orders.value).some((currentMenuId) => {
        const item = menuObj.value[currentMenuId];
        return item && onlyLunchOrDinner(item).onlyDinner;
      });
    });
    const hasLunchOnlyOrder = computed(() => {
      return Object.keys(orders.value).some((currentMenuId) => {
        const item = menuObj.value[currentMenuId];
        return item && onlyLunchOrDinner(item).onlyLunch;
      });
    });
    const resetCart = () => {
      orders.value = {};
      cartItems.value = {};
    };
    watch(lunchOrDinner, (v) => {
      if (v === "lunch") {
        if (hasDinnerOnlyOrder.value) {
          resetCart();
        }
      }
      if (v === "dinner") {
        if (hasLunchOnlyOrder.value) {
          resetCart();
        }
      }
    });
    //

    const trimmedSelectedOptions = computed(() => {
      return getTrimmedSelectedOptions(
        orders.value,
        cartItems.value,
        selectedOptions.value,
      ) as any;
    });
    const prices = computed(() => {
      return getPrices(
        multiple,
        orders.value,
        cartItems.value,
        trimmedSelectedOptions.value,
      );
    });
    const totalPrice = computed(() => {
      const subTotal = prices2subtotal(prices.value);
      const total = subtotal2total(subTotal, cartItems.value, props.shopInfo);
      return { subTotal, total };
    });
    const postOptions = computed(() => {
      return getPostOption(trimmedSelectedOptions.value, cartItems.value);
    });

    const didOrderdChange = (eventArgs: {
      quantities: number[];
      itemId: string;
      optionValues: string;
      itemData: MenuData;
    }) => {
      // NOTE: We need to assign a new object to trigger computed properties
      if (eventArgs.quantities) {
        cartItems.value[eventArgs.itemId] = menuObj.value[eventArgs.itemId];
        const newObject = { ...orders.value };
        if (arraySum(eventArgs.quantities) > 0) {
          newObject[eventArgs.itemId] = eventArgs.quantities;
        } else {
          delete newObject[eventArgs.itemId];
        }
        orders.value = newObject;
      }
      if (eventArgs.optionValues) {
        selectedOptions.value = Object.assign({}, selectedOptions.value, {
          [eventArgs.itemId]: eventArgs.optionValues,
        });
      }
    };
    const updateSelectedOptions = (id: string, e: any) => {
      const newSelectedOptions = Object.assign({}, selectedOptions.value);
      newSelectedOptions[id] = e;
      selectedOptions.value = newSelectedOptions;
    };
    const goCheckout = async () => {
      const name = await (async () => {
        if (isLiffUser.value) {
          try {
            const currentUser = (await liff.getProfile()) || {};
            return currentUser.displayName;
          } catch (__e) {
            return "";
          }
        }
        return user.value.displayName;
      })();

      const isStoreUserName = props.shopInfo.personalInfo !== "notRequired";
      const order_data = {
        order: orders.value,
        options: convOptionArray2Obj(postOptions.value),
        rawOptions: convOptionArray2Obj(trimmedSelectedOptions.value),
        status: order_status.new_order,
        uid: user.value.uid,
        ownerUid: props.shopInfo.uid,
        lunchOrDinner: props.shopInfo.enableLunchDinner
          ? lunchOrDinner.value
          : null,
        isDelivery:
          (props.shopInfo.enableDelivery && isDelivery.value) || false, // true, // for test
        isPickup: false,
        isLiff: isLiffUser.value,
        phoneNumber: user.value.phoneNumber,
        name: isStoreUserName ? name : "",
        updatedAt: serverTimestamp(),
        timeCreated: serverTimestamp(),
        // price never set here.
      };
      isCheckingOut.value = true;
      try {
        const res = await addDoc(
          collection(db, `restaurants/${restaurantId.value}/orders`),
          order_data,
        );
        // Store the current order associated with this order id, so that we can re-use it
        // when the user clicks the "Edit Items" on the next page.
        // In that case, we will come back here with #id so that we can retrieve it (see mounted).
        store.commit("saveCart", {
          id: restaurantId.value,
          cart: {
            orders: orders.value,
            options: selectedOptions.value,
            cartItems: cartItems.value,
            menuCache: menuCache.value,
            howtoreceive: howtoreceive.value,
            lunchOrDinner: lunchOrDinner.value,
          },
        });
        await orderCreated({
          restaurantId: restaurantId.value,
          orderId: res.id,
        });

        try {
          const checkoutMenus: AnalyticsMenuData[] = [];
          Object.keys(orders.value).forEach((currentMenuId) => {
            orders.value[currentMenuId].forEach((quantity: number) => {
              const menu = Object.assign({}, cartItems.value[currentMenuId]);
              menu.quantity = quantity;
              checkoutMenus.push(menu);
            });
          });
          analyticsUtil.sendBeginCheckoout(
            totalPrice.value.total,
            checkoutMenus,
            props.shopInfo,
            restaurantId.value,
          );
        } catch (e) {
          console.log(e);
        }
        if (props.mode === "liff") {
          const liffIndexId = route.params.liffIndexId;
          router.push({
            path: `/liff/${liffIndexId}/r/${restaurantId.value}/order/${res.id}`,
          });
        } else {
          router.push({
            path: `/r/${restaurantId.value}/order/${res.id}`,
          });
        }
      } catch (error: any) {
        if (error.code === "permission-denied" && retryCount.value < 3) {
          retryCount.value += 1;
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

      if (isUser.value || isLiffUser.value) {
        goCheckout();
      } else {
        window.scrollTo(0, 0);
        loginVisible.value = true;
      }
    };
    const handleDismissed = () => {
      // The user has dismissed the login dialog (including the successful login)
      loginVisible.value = false;
      if (isUser.value || isLiffUser.value) {
        goCheckout();
      } else {
        console.log("this.user it not ready yet");
        waitForUser.value = true;
      }
    };

    watch(user, (newValue) => {
      if (waitForUser.value && newValue) {
        console.log("handling deferred notification");
        goCheckout();
      }
    });
    const cartButton = ref();
    const isShowCart = computed(() => {
      return cartButton.value?.isShowCart || false;
    });
    const closeCart = () => {
      cartButton.value?.closeCart();
    };

    let y = 0;
    watch(isShowCart, (value) => {
      if (value) {
        y = window.pageYOffset;
        document.body.style.position = "fixed";
      } else {
        document.body.style.position = "";
        if (y) {
          scrollTo(0, y);
        }
      }
    });
    onUnmounted(() => {
      // if (isShowCart.value) {
      document.body.style.position = "";
      // }
    });

    const filteredTitleLists = computed(() => {
      const menuLists = props.shopInfo.menuLists || [];
      const itemsObj = array2obj(titles.value);
      return (
        menuLists
          .map((itemId) => {
            return { ...itemsObj[itemId] };
          })
          .filter((item) => {
            return item && item.id;
          })
          .filter((title) => title.name !== "")
          .filter(lunchOrDinnerFilter) || []
      );
    });

    const scrollTop = () => {
      scrollToElementById("RestaurantLeftTop");
    };
    const pageBase = computed(() => {
      return basePath.value + "/r/" + restaurantId.value;
    });
    const closeTransactionsAct = () => {
      scrollTop();
      router.push(pageBase.value);
    };
    const isTransactionAct = computed(() => {
      return !!route.meta.isTransactionsAct;
    });

    const totalQuantities = computed(() => {
      const ret = Object.values(orders.value).reduce((total, order) => {
        return total + arraySum(order);
      }, 0);
      return ret;
    });
    // for banner
    const promotion = computed(() => {
      if (props.promotions.length > 0) {
        return props.promotions[props.promotions.length - 1];
      }
      return null;
    });
    const matchedPromotions = computed(() => {
      return props.promotions.filter((a) => {
        return totalPrice.value.total >= a.discountThreshold;
      });
    });
    const possiblePromotions = computed(() => {
      return props.promotions.filter((a) => {
        return a.discountThreshold > totalPrice.value.total;
      });
    });

    const {
      imagePopup,
      openImage,
      closeImage,
      categoryPopup,
      openCategory,
      closeCategory,
    } = imageUtils();

    return {
      itemLists,
      titleLists: filteredTitleLists,

      coverImage,
      menuId,

      isOwner,
      isSubAccount,
      isDelivery,
      howtoreceive,

      orders,

      selectedOptions, // for initial cart status when switch tab

      totalPrice,
      prices,
      totalQuantities,
      promotion,
      matchedPromotions,
      possiblePromotions,

      isPreview,

      didOrderdChange,
      updateSelectedOptions,

      handleCheckOut,
      handleDismissed,

      loginVisible,
      isCheckingOut,
      noAvailableTime,

      // imageUtils
      imagePopup,
      openImage,
      closeImage,
      categoryPopup,
      openCategory,
      closeCategory,

      isShowCart,
      cartButton,
      closeCart,
      menuObj,
      cartItems,
      menuPickupData, // not mo.

      isTransactionAct,
      closeTransactionsAct,
      pageBase,
      scrollTop,

      lunchOrDinner,
      hasDinnerOnlyOrder,
      hasLunchOnlyOrder,
    };
  },
});
</script>
