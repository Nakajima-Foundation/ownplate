<template>
  <div>
    <template v-if="notFound == null"></template>
    <template v-else-if="notFound && !isOwner">
      <not-found />
    </template>
    <template v-else>
      <div
        v-if="pageId"
        class="fixed top-0 z-20 h-full w-full bg-white"
        >
        <MoPage
          :pageId="pageId"
          :pageBase="pageBase"
          :groupData="groupData"
          @didOrderdChange="didOrderdChange($event)"
          :orders="orders"
          :selectedOptions="selectedOptions"
          :shopInfo="shopInfo"
          :isPickup="isPickup"
          />
      </div>
      <!-- category modal -->
      <div
        v-if="isOpenGroupCategory"
        class="fixed top-0 z-40 h-full w-full bg-white"
      >
        <div class="m-4">
          <span class="text-xl font-bold text-black text-opacity-30">
            {{ $t("shopInfo.productCategory") }}
          </span>
        </div>
        <div class="mx-4 h-[calc(100%-3rem)] overflow-x-scroll">
          <CategoryModal
            class="mb-20"
            :categoryData="categoryData"
            :howtoreceive="howtoreceive"
          />
        </div>
      </div>

      <!-- category modal -->
      <div
        v-if="isOpenGroupSubCategory"
        class="fixed top-0 z-40 h-full w-full bg-white"
      >
        <div class="mx-4 h-[calc(100%-3rem)] overflow-x-scroll">
          <SubCategoryModal
            class="mb-20"
            :subCategoryData="subCategoryData"
            :howtoreceive="howtoreceive"
            :selectedCategory="selectedCategory"
          />
        </div>
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
            <div class="lg:mt-6" v-if="!isInMo">
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
                <div v-if="shopInfo.moCloseDate">
                  <div
                    class="my-2 rounded-lg bg-red-700 bg-opacity-10 p-3 text-center text-sm font-bold text-red-700"
                  >
                    {{
                      $t("mobileOrder.shopInfo.closeNote", {
                        date: moment(shopInfo.moCloseDate.toDate()).format(
                          "M/D"
                        ),
                        time: moment(shopInfo.moCloseDate.toDate()).format(
                          "HH:mm"
                        ),
                      }, 0)
                    }}
                  </div>
                </div>
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
                <div class="text-xl font-bold text-black text-opacity-30">
                  {{
                    shopInfo.isEC
                      ? $t("shopInfo.ecShopDetails")
                      : isInMo
                      ? $t("mobileOrder.storeDetails")
                      : $t("shopInfo.restaurantDetails")
                  }}
                </div>

                <div class="mt-2">
                  <shop-info
                    :shopInfo="shopInfo"
                    :paymentInfo="paymentInfo"
                    :isDelivery="isDelivery"
                    :mode="mode"
                    :isPickup="isPickup"
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
              <div class="rounded-lg bg-white shadow">
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

            <!-- Mo Suspend -->
            <div v-if="moSuspend && isInMo">
              <div
                class="mx-6 mt-3 mb-2 rounded-lg bg-red-700 bg-opacity-10 p-3 font-bold text-red-700 lg:mx-0"
              >
                {{ $t("mobileOrder.suspendMessage") }}
              </div>
            </div>

            <div v-if="moPickup && isInMo">
              <!-- Mo Pickup Suspend -->

              <div
                class="mx-6 mt-3 mb-2 rounded-lg bg-red-700 bg-opacity-10 p-3 font-bold text-red-700 lg:mx-0"
                v-if="moPickupSuspend"
              >
                {{ $t("mobileOrder.suspendPickupMessage") }}
              </div>

              <!-- Mo Pickup Toggle -->
              <div class="mx-6 mt-3 mb-2 lg:mx-0" id="mo_top">
                <div>
                  <MoPickUp
                    :shopInfo="shopInfo"
                    v-model="howtoreceive"
                    :orders="orders"
                    :disabledPickupTime="disabledPickupTime"
                    :noAvailableTime="noAvailableTime"
                    :lastOrder="lastOrder"
                    :moPickupSuspend="moPickupSuspend"
                  />
                </div>
              </div>
            </div>

            <!-- stock filter Toggle-->
            <div>
              <MoSetBanner v-if="showSubCategory && enableCampaignBanner"
                           :pageBase="pageBase"
                           />
              <div v-if="showSubCategory && isPickup">
                <div class="mx-6 mt-4 grid grid-cols-2 gap-2 lg:mx-0">
                  <!-- 在庫なし含む -->
                  <div
                    class="shado-none h-full w-full rounded-lg border-2 bg-white p-2 text-op-teal"
                    :class="
                      !isFilterStock
                        ? 'border-op-teal'
                        : 'cursor-pointer border-black border-opacity-10'
                    "
                    @click="isFilterStock = !isFilterStock"
                  >
                    <div
                      class="-mt-0.5 text-center text-lg font-bold tracking-tighter"
                    >
                      {{ $t("mobileOrder.shopInfo.showAll") }}
                    </div>
                  </div>

                  <!-- 在庫ありのみ -->
                  <div
                    class="h-full w-full rounded-lg border-2 bg-white p-2 text-op-teal shadow-none"
                    :class="
                      isFilterStock
                        ? 'border-op-teal '
                        : 'cursor-pointer border-black border-opacity-10'
                    "
                    @click="isFilterStock = !isFilterStock"
                  >
                    <div class="-mt-0.5 text-center text-lg font-bold">
                      {{ $t("mobileOrder.shopInfo.showOnlyInStock") }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- For Responsible -->
            <div class="mx-6 mt-3 lg:mx-0">
              <!-- Category Icon -->
              <div v-if="isShowCategoryIcon">
                <CategoryIcon
                  :howtoreceive="howtoreceive"
                  :selectedCategory="selectedCategory"
                  :selectedSubCategory="selectedSubCategory"
                  :subCategory="subCategory"
                  />
              </div>
              <div v-if="showCategory">
                <!-- Category view -->
                <div class="grid-col-1 mt-6 grid space-y-2">
                  <div class="text-xl font-bold text-black text-opacity-30">
                    {{ $t("shopInfo.productCategory") }}
                  </div>
                  <MoSetBanner
                    v-if="enableCampaignBanner"
                    :pageBase="pageBase"
                    />
                  <CategoryTop
                    :categoryData="categoryData"
                    :howtoreceive="howtoreceive"
                  />
                </div>
              </div>
              <div v-else>
                <template v-if="!isInMo">
                  <!-- Menu Items for omochikaeri -->
                  <div class="grid-col-1 grid space-y-2" :key="subCategoryKey">
                    <template v-for="(item, key) in itemLists">
                      <div v-if="item._dataType === 'title'" :key="key">
                        <div
                          class="inline-flex items-center justify-center text-xl font-bold text-black text-opacity-30"
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

                      <div
                        v-if="item._dataType === 'menu'"
                        :key="[subCategoryKey, item.id].join('_')"
                      >
                        <Menu
                          :key="[subCategoryKey, 'item', item.id].join('_')"
                          :item="item"
                          :menuPickupData="menuPickupData[item.id] || {}"
                          :quantities="orders[item.id] || [0]"
                          :selectedOptions="selectedOptions[item.id]"
                          :initialOpenMenuFlag="
                            (orders[item.id] || []).length > 0
                          "
                          :shopInfo="shopInfo"
                          :menuLinkBathPath="menuLinkBathPath"
                          :isOpen="menuId === item.id"
                          :prices="prices[item.id] || []"
                          :mode="mode"
                          @didOrderdChange="didOrderdChange($event)"
                        ></Menu>
                      </div>
                    </template>
                  </div>
                </template>
                <template v-else>
                  <!-- Menu Items for Mo -->
                  <div
                    class="mt-3 grid min-h-screen grid-cols-3 content-start gap-2"
                    :key="subCategoryKey"
                  >
                    <template v-for="(item, key) in itemLists">
                      <div
                        v-if="
                          item._dataType === 'menu' &&
                          (!moPickup ||
                            (isPublucDataSet[item.id] || {}).isPublic)
                        "
                        :key="[subCategoryKey, item.id].join('_')"
                      >
                        <MenuMo
                          :key="[subCategoryKey, 'item', item.id].join('_')"
                          :item="item"
                          :menuPickupData="menuPickupData[item.id] || {}"
                          :quantities="orders[item.id] || [0]"
                          :selectedOptions="selectedOptions[item.id]"
                          :initialOpenMenuFlag="
                            (orders[item.id] || []).length > 0
                          "
                          :shopInfo="shopInfo"
                          :menuLinkBathPath="menuLinkBathPath"
                          :isOpen="menuId === item.id"
                          :prices="prices[item.id] || []"
                          :mode="mode"
                          :isPickup="isPickup"
                          :moSoldOutData="moSoldOutDataSet[item.id] || {}"
                          @didOrderdChange="didOrderdChange($event)"
                        ></MenuMo>
                      </div>
                    </template>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div class="mx-6 mt-8" v-if="!isTransactionAct">
          <div class="rounded-lg bg-white shadow">
            <router-link :to="pageBase + '/transactions-act'">
              <div class="p-4 inline-flex items-center justify-center" @click="scrollTop">
                <i class="material-icons mr-2 text-lg text-op-teal">account_balance</i>
                <div class="text-sm font-bold text-op-teal">
                  {{ $t("transactionsAct.title") }}
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Phone Login-->
      <o-modal v-model:active="loginVisible" :width="488" scroll="keep">
        <div class="mx-2 my-6 rounded-lg bg-white p-6 shadow-lg">
          <phone-login v-on:dismissed="handleDismissed" />
        </div>
      </o-modal>
      <Cart
        v-if="isShowCart"
        @closeCart="closeCart"
        :orders="orders"
        :selectedOptions="selectedOptions"
        :menuObj="cartItems"
        :prices="prices"
        :shopInfo="shopInfo"
        :disabledPickupTime="disabledPickupTime"
        :lastOrder="lastOrder"
        @didOrderdChange="didOrderdChange"
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
        :noAvailableTime="noAvailableTime"
        :isDelivery="isDelivery"
        :totalPrice="totalPrice"
        :disabledPickupTime="disabledPickupTime"
        :moSuspend="moSuspend"
      />
    </template>
    <!-- Image Popup-->
    <o-modal v-model:active="imagePopup" :width="488" scroll="keep">
      <div class="px-2 text-center" @click.stop="closeImage()">
        <img :src="coverImage" class="rounded-lg shadow-lg" />
      </div>
    </o-modal>
    <!-- Image Popup ??-->
    <o-modal v-model:active="categoryPopup" :width="488" scroll="keep">
      <div class="px-2 text-center">
        <div class="mx-2 my-6 rounded-lg bg-white p-6 shadow-lg">
          <template v-for="(title, key) in titleLists">
            <a
              :href="`#${title.id}`"
              class="mx-1 mt-2 inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5"
              @click="closeCategory"
            >
              <div class="mx-2 text-sm font-bold text-op-teal">
                {{ title.name }}
              </div>
            </a>
          </template>
        </div>
      </div>
    </o-modal>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  watch,
  watchEffect,
  computed,
  onBeforeMount,
  onUnmounted,
  PropType,
} from "vue";

import moment from "moment-timezone";

import Menu from "@/app/user/Restaurant/Menu.vue";
import MenuMo from "@/app/user/Restaurant/MenuMo.vue";
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
import CategoryModal from "@/app/user/Restaurant/CategoryModal.vue";
import SubCategoryModal from "@/app/user/Restaurant/SubCategoryModal.vue";
import CategoryTop from "@/app/user/Restaurant/CategoryTop.vue";
import CategoryIcon from "@/app/user/Restaurant/CategoryIcon.vue";
import Titles from "@/app/user/Restaurant/Titles.vue";
import SubCategoryList from "@/app/user/Restaurant/SubCategoryList.vue";
import TransactionsActContents from "@/app/user/TransactionsAct/Contents.vue";
import MoPickUp from "@/app/user/Restaurant/MoPickUp.vue";
import MoPage from "@/app/user/Mo/MoPage.vue";
import MoSetBanner from "@/app/user/Mo/MoSetBanner.vue";

import { usePickupTime } from "@/utils/pickup";

import liff from "@line/liff";
import { db } from "@/lib/firebase/firebase9";
import {
  addDoc,
  query,
  onSnapshot,
  collection,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { orderCreated } from "@/lib/firebase/functions";

import { order_status } from "@/config/constant";

import { ownPlateConfig, moTitle, moPickup, enableCampaignBanner } from "@/config/project";
import * as analyticsUtil from "@/lib/firebase/analytics";

import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { MenuData } from "@/models/menu";
import { AnalyticsMenuData } from "@/lib/firebase/analytics";

import {
  array2obj,
  arraySum,
  convOptionArray2Obj,
  prices2subtotal,
  subtotal2total,
  getPrices,
  getTrimmedSelectedOptions,
  getPostOption,
  useIsInMo,
  useToggle,
  scrollToElementById,
  useUserData,
  useBasePath,
} from "@/utils/utils";

import { imageUtils } from "@/utils/RestaurantUtils";

import {
  useTitles,
  useCategory,
  useSubcategory,
  useMenu,
  useCategoryParams,
  loadStockData,
} from "./Restaurant/Utils";

import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  name: "RestaurantPage",

  components: {
    Menu,
    MenuMo,
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
    TransactionsActContents,
    CategoryModal,
    SubCategoryModal,
    CategoryTop,
    CategoryIcon,
    Titles,
    SubCategoryList,

    MoPickUp,
    MoPage,
    MoSetBanner,
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
      type: Array,
      required: true,
    },
    moPrefix: {
      type: String,
      required: false,
    },
    groupData: {
      type: Object,
      required: false,
    },
    moSuspend: {
      type: Boolean,
      required: false,
    },
    moPickupSuspend: {
      type: Boolean,
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
              this.isInMo
                ? moTitle
                : ownPlateConfig.restaurantPageTitle || this.defaultTitle,
            ].join(" / "),
    };
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

    const orders = ref<{[key: string]: number[]}>({});
    const cartItems = ref<{[key: string]: any}>({});
    const selectedOptions = ref({});

    const multiple = store.getters.stripeRegion.multiple;

    const isInMo = useIsInMo();
    const basePath = useBasePath();

    const defaultHowToReceive = (() => {
      // for 333
      const rId = route.params.restaurantId as string;
      if (store.state.carts[rId]) {
        const cart = store.state.carts[rId] || {};
        if (cart.howtoreceive) {
          return cart.howtoreceive;
        }
      }
      if (props.shopInfo.enableMoPickup) {
        return "pickup";
      }
      return "takeout";
    })();
    const howtoreceive = ref(defaultHowToReceive);
    const isFilterStock = ref(false);

    const {
      category,
      subCategory,
      watchCat,
      hasCategory,
      showCategory,
      showSubCategory,
    } = useCategoryParams(isInMo.value || false);

    const restaurantId = computed(() => {
      return route.params.restaurantId as string;
    });
    const menuId = computed(() => {
      return route.params.menuId;
    });

    const {
      user,
      uid,
      isAdmin,
      isUser,
      isLiffUser,
    } = useUserData();
    const isOwner = computed(() => {
      return isAdmin.value && uid.value === props.shopInfo.uid;
    });
    const isPreview = computed(() => {
      return props.notFound && isOwner.value;
    });

    const isDelivery = computed(() => {
      return howtoreceive.value === "delivery";
    });
    const isPickup = computed(() => {
      return howtoreceive.value === "pickup";
    });
    // force reset
    const moPickupSuspend = computed(() => {
      return props.moPickupSuspend;
    });
    watch(moPickupSuspend, (v) => {
      if (v) {
        howtoreceive.value = "takeout";
      }
    });

    const coverImage = computed(() => {
      return (
        (props.shopInfo?.images?.cover?.resizedImages || {})["1200"] ||
        props.shopInfo.restCoverPhoto
      );
    });

    const { loadMenu, setCache, menus, menuObj, menuCache } = useMenu(
      restaurantId,
      isInMo,
      category,
      subCategory,
      props.groupData
    );

    const { menuPickupData, availableDays, todaysLast } = usePickupTime(
      props.shopInfo,
      {},
      menuObj,
      isInMo.value,
      isPickup
    );
    const lastOrder = computed(() => {
      return (todaysLast.value || {}).lastOrderDisplay;
    });

    const disabledPickupTime = computed(() => {
      if (isPickup.value) {
        const now = Number(
          moment(store.state.date).tz("Asia/Tokyo").format("HHmm")
        );
        const last = Number((todaysLast.value || {}).lastOrderStr || 0);
        return now > last;
      }
      return false;
    });

    // for Mo
    const { preOrderPublics, pickupPublics, pickupStocks } = loadStockData(
      db,
      props.shopInfo
    );

    const isPublucDataSet = computed(() => {
      if (isPickup.value) {
        return pickupPublics.value[subCategory.value] || {};
      } else {
        return preOrderPublics.value[subCategory.value] || {};
      }
    });
    const moSoldOutDataSet = computed<{[key: string]: any}>(() => {
      if (isPickup.value) {
        return pickupStocks.value[subCategory.value] || {};
      }
      return {};
    });
    // end of for Mo

    // changed from onMount
    // avoid to reset cart when pickup or other not takeout
    onBeforeMount(() => {
      // Check if we came here as the result of "Edit Items"
      if (store.state.carts[restaurantId.value]) {
        const cart = store.state.carts[restaurantId.value] || {};
        orders.value = cart.orders || {};
        cartItems.value = cart.cartItems || {};
        selectedOptions.value = cart.options || {};
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
        restaurantId.value
      );
    });

    watch(watchCat, () => {
      loadMenu();
    });
    watch(category, () => {
      if (category.value) {
        loadSubcategory();
        updateMoUrl();
      }
    });

    const updateMoUrl = () => {
      const { category, subCategory, restaurantId } = route.params;
      if (howtoreceive.value && subCategory) {
        const newPath = `/${props.moPrefix}/r/${restaurantId}/cat/${category}/${subCategory}/${howtoreceive.value}`;
        if (newPath !== route.path) {
          router.replace({
            path: newPath,
          });
        }
      }
    };
    watch(howtoreceive, (value) => {
      if (isInMo.value) {
        updateMoUrl();
        orders.value = {};
      }
    });

    const { loadTitle, titles, titleLists } = useTitles(restaurantId);

    const { loadCategory, categoryData } = useCategory(props.moPrefix || "");

    const { subCategoryData, loadSubcategory } = useSubcategory(
      props.moPrefix || "",
      category
    );

    const selectedCategory = computed(() => {
      if (category.value && categoryData.value) {
        return (
          categoryData.value.find((cat) => {
            return cat.id === category.value;
          }) || {}
        );
      }
      return {};
    });

    const selectedSubCategory = computed(() => {
      if (subCategory.value && subCategoryData.value) {
        return (
          subCategoryData.value.find((cat) => {
            return cat.id === subCategory.value;
          }) || {}
        );
      }
      return {};
    });

    if (isInMo.value) {
      loadCategory();
      if (category.value) {
        loadSubcategory();
        updateMoUrl();
      }
    }
    if (!isInMo.value) {
      loadTitle();
    }

    const itemLists = computed(() => {
      if (isInMo.value) {
        if (isPickup.value) {
          return menus.value
            .filter((menu) => {
              if (isFilterStock.value) {
                const soldOutData = moSoldOutDataSet.value[menu.id] || {};
                const isStock =
                  !menu.soldOut &&
                  (!!soldOutData.forcePickupStock || !!soldOutData.isStock);
                return isStock;
              }
              return true;
            })
            .sort((a, b) => {
              return a.itemName > b.itemName ? 1 : -1;
            });
          /*
            .sort((a, b) => {
            const aSoldOutData = moSoldOutDataSet.value[a.id] || {};
            const aIsStock =
              !a.soldOut &&
              (!!aSoldOutData.forcePickupStock || !!aSoldOutData.isStock);

            const bSoldOutData = moSoldOutDataSet.value[b.id] || {};
            const bIsStock =
              !b.soldOut &&
              (!!bSoldOutData.forcePickupStock || !!bSoldOutData.isStock);

            if (aIsStock === bIsStock) {
              return a.itemName > b.itemName ? 1 : -1;
            }

            return aIsStock ? -1 : 1;
            });
          */
        } else {
          return menus.value.sort((a, b) => {
            return a.itemName > b.itemName ? 1 : -1;
          });
        }
      } else {
        const menuLists = props.shopInfo.menuLists || [];
        const itemsObj = array2obj(menus.value.concat(titles.value));
        return menuLists
          .map((itemId) => {
            return { ...itemsObj[itemId] };
          })
          .filter((item) => {
            return item;
          })
          .filter((item) => {
            return !(item._dataType === "title" && item.name === "");
          });
      }
    });

    const totalPrice = computed(() => {
      const subTotal = prices2subtotal(prices.value);
      const total = subtotal2total(subTotal, cartItems.value, props.shopInfo);
      return { subTotal, total };
    });
    const trimmedSelectedOptions = computed(() => {
      return getTrimmedSelectedOptions(
        orders.value,
        cartItems.value,
        selectedOptions.value
      ) as any;
    });
    const postOptions = computed(() => {
      return getPostOption(trimmedSelectedOptions.value, cartItems.value);
    });
    const prices = computed(() => {
      return getPrices(
        multiple,
        orders.value,
        cartItems.value,
        trimmedSelectedOptions.value
      );
    });

    const didOrderdChange = (eventArgs: {quantities: number | number[], itemId: string, optionValues: string, itemData: MenuData}) => {
      // NOTE: We need to assign a new object to trigger computed properties
      if (eventArgs.quantities) {
        if (eventArgs.itemData) { // for mo campaign
          cartItems.value[eventArgs.itemId] = eventArgs.itemData
        } else {
          cartItems.value[eventArgs.itemId] = menuObj.value[eventArgs.itemId];
        }
        const newObject = { ...orders.value };
        if (arraySum(eventArgs.quantities as number[]) > 0) {
          // @ts-ignore
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
    const goCheckout = async () => {
      const name = await (async () => {
        if (isLiffUser.value) {
          try {
            const user = (await liff.getProfile()) || {};
            return user.displayName;
          } catch (e) {
            return "";
          }
        }
        if (isInMo.value) {
          return "";
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
        isPickup: (props.shopInfo.enableMoPickup && isPickup.value) || false,
        isLiff: isLiffUser.value,
        phoneNumber: user.value.phoneNumber,
        name: name,
        updatedAt: serverTimestamp(),
        timeCreated: serverTimestamp(),
        // price never set here.
      };
      // console.log(order_data);
      isCheckingOut.value = true;
      try {
        const res = await addDoc(
          collection(db, `restaurants/${restaurantId.value}/orders`),
          order_data
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
          },
        });
        await orderCreated({
          restaurantId: restaurantId.value,
          orderId: res.id,
        });

        try {
          const checkoutMenus: AnalyticsMenuData[] = [];
          Object.keys(orders.value).forEach((menuId) => {
            orders.value[menuId].forEach((quantity: number) => {
              const menu = Object.assign({}, cartItems.value[menuId]);
              menu.quantity = quantity;
              checkoutMenus.push(menu);
            });
          });
          analyticsUtil.sendBeginCheckoout(
            totalPrice.value.total,
            checkoutMenus,
            props.shopInfo,
            restaurantId.value
          );
        } catch (e) {
          console.log(e);
        }
        if (props.mode === "liff") {
          const liffIndexId = route.params.liffIndexId;
          router.push({
            path: `/liff/${liffIndexId}/r/${restaurantId.value}/order/${res.id}`,
          });
        } else if (props.mode === "mo") {
          router.push({
            path: `/${props.moPrefix}/r/${restaurantId.value}/order/${res.id}`,
          });
        } else {
          router.push({
            path: `/r/${restaurantId.value}/order/${res.id}`,
          });
        }
      } catch (error: any) {
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
    const categoryBathPath = computed(() => {
      return `/${props.moPrefix}/r/${restaurantId.value}/cat/${category.value}`;
    });
    const menuLinkBathPath = computed(() => {
      return `/cat/${category.value}/${subCategory.value}`;
    });
    const subCategoryKey = computed(() => {
      return showSubCategory.value
        ? [category.value, subCategory.value].join("_")
        : "";
    });

    const isOpenGroupCategory = computed(() => {
      return route.params.list === "categories";
    });
    const isOpenGroupSubCategory = computed(() => {
      return route.params.list === "category";
    });

    const cartButton = ref();
    const isShowCart = computed(() => {
      return cartButton.value?.isShowCart;
    });
    const closeCart = () => {
      cartButton.value?.closeCart();
    };

    const isShowCategoryIcon = computed(() => {
      return (
        !!showSubCategory.value &&
        !isOpenGroupCategory.value &&
        !isOpenGroupSubCategory.value &&
        !isShowCart.value
      );
    });

    watchEffect(() => {
      if (isShowCategoryIcon.value) {
        setTimeout(() => {
          scrollToElementById("mo_top");
        }, 200);
      }
    });

    watch(isShowCart, (value) => {
      if (value) {
        document.body.style.position = "fixed";
      } else {
        document.body.style.position = "";
      }
    });
    onUnmounted(() => {
      if (isShowCart.value) {
        document.body.style.position = "";
      }
    });
    //
    watch(isOpenGroupCategory, (value) => {
      if (value) {
        document.body.style.position = "fixed";
      } else {
        document.body.style.position = "";
        scrollToElementById("subCategoryTop");
      }
    });
    onUnmounted(() => {
      if (isOpenGroupCategory.value) {
        document.body.style.position = "";
      }
    });
    watch(isOpenGroupSubCategory, (value) => {
      if (value) {
        document.body.style.position = "fixed";
      } else {
        document.body.style.position = "";
        scrollToElementById("subCategoryTop");
      }
    });
    onUnmounted(() => {
      if (isOpenGroupSubCategory.value) {
        document.body.style.position = "";
      }
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
          }) || []
      ).filter((title) => title.name !== "");
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
    const pageId = computed(() => {
      return route.params.pageId as string;
    });
    return {
      itemLists,
      titleLists: filteredTitleLists,

      coverImage,
      menuId,

      isOwner,
      isDelivery,
      howtoreceive,

      orders,

      selectedOptions, // for initial cart status when switch tab

      totalPrice,
      prices,

      isPreview,

      selectedCategory,
      selectedSubCategory,

      didOrderdChange,

      handleCheckOut,
      handleDismissed,

      loginVisible,
      isCheckingOut,
      noAvailableTime,

      showCategory,
      showSubCategory,
      subCategoryKey,
      isShowCategoryIcon,

      categoryData,
      subCategoryData,
      categoryBathPath,

      menuLinkBathPath,

      subCategory,

      isOpenGroupCategory,
      isOpenGroupSubCategory,

      ...imageUtils(),

      isShowCart,
      cartButton,
      closeCart,
      menuObj,
      cartItems,
      menuPickupData,

      isInMo,
      isPickup,

      isPublucDataSet,
      moSoldOutDataSet,

      moPickup,
      disabledPickupTime,
      lastOrder,
      enableCampaignBanner,

      isFilterStock,
      isTransactionAct,
      closeTransactionsAct,
      pageBase,
      scrollTop,

      moment,
      pageId,
    };
  },
});
</script>
