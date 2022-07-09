<template>
  <div>
    <template v-if="notFound == null"></template>
    <template v-else-if="notFound && !isOwner">
      <not-found />
    </template>
    <template v-else>
      <!-- category modal -->
      <div v-if="isOpenGroupCategory"
           class="fixed top-0 bg-white w-full"
           >
        <Category :categoryData="categoryData"/>
      </div>
      
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
                  <favorite-button :shopInfo="shopInfo"></favorite-button>
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
                <!-- delivery -->
                <Delivery
                  :shopInfo="shopInfo"
                  :deliveryData="deliveryData"
                  v-model="howtoreceive"
                />
                <!-- delivery -->
              </div>
            </div>
            <!-- titles for omochikaeri -->
            <Titles :titleLists="titleLists" />

            <!-- category for mo -->
            <div v-if="showSubCategory">
              <SubCategoryList
                :subCategoryData="subCategoryData"
                :categoryBathPath="categoryBathPath"
              />
            </div>

            <!-- For Responsible -->
            <div class="mx-6 mt-3 lg:mx-0">
              <!-- Menu Items -->
              <div v-if="showSubCategory">
                <div @click="openGroupCategory">CATEGORY!!</div>
              </div>
              <div v-if="showCategory">
                <div class="grid grid-col-1 space-y-2">
                  <Category :categoryData="categoryData" />
                </div>
              </div>
              <div v-else>
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

                    <div
                      v-if="item._dataType === 'menu'"
                      :key="[subCategoryKey, item.id].join('_')"
                    >
                      <item-card
                        :key="[subCategoryKey, 'item', item.id].join('_')"
                        :item="item"
                        :quantities="orders[item.id] || [0]"
                        :optionPrev="
                          selectedOptionsPrev[item.id] ||
                          selectedOptions[item.id]
                        "
                        :initialOpenMenuFlag="
                          (orders[item.id] || []).length > 0
                        "
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
      </div>

      <!-- Phone Login-->
      <b-modal :active.sync="loginVisible" :width="488" scroll="keep">
        <div class="mx-2 my-6 p-6 bg-white shadow-lg rounded-lg">
          <phone-login v-on:dismissed="handleDismissed" />
        </div>
      </b-modal>

      <!-- Cart Button -->
      <div v-if="isCheckingOut" class="fixed top-0 left-0 w-full h-full"></div>
      <CartButton
        @handleCheckOut="handleCheckOut"
        :shopInfo="shopInfo"
        :orders="orders"
        :paymentInfo="paymentInfo"
        :deliveryData="deliveryData"
        :isCheckingOut="isCheckingOut"
        :noAvailableTime="noAvailableTime"
        :isDelivery="isDelivery"
        :totalPrice="totalPrice"
      />
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

import RestaurantPreview from "@/app/user/Restaurant/Preview.vue";
import CartButton from "@/app/user/Restaurant/CartButton.vue";
import Delivery from "@/app/user/Restaurant/Delivery.vue";
import Category from "@/app/user/Restaurant/Category.vue";
import Titles from "@/app/user/Restaurant/Titles.vue";
import SubCategoryList from "@/app/user/Restaurant/SubCategoryList.vue";

import liff from "@line/liff";
import { db as dbOld, firestore } from "@/plugins/firebase";

import { db } from "@/lib/firebase/firebase9";
import {
  addDoc,
  query,
  onSnapshot,
  collection,
  where,
} from "firebase/firestore";

import { wasOrderCreated } from "@/lib/firebase/functions";

import { order_status } from "@/config/constant";

import { ownPlateConfig } from "@/config/project";
import * as analyticsUtil from "@/lib/firebase/analytics";

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
} from "@/utils/utils";

import { imageUtils } from "@/utils/RestaurantUtils";

import {
  useTitles,
  useCategory,
  useSubcategory,
  useMenu,
  useCategoryParams,
} from "./Restaurant/Utils";

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
    RestaurantPreview,
    CartButton,
    Delivery,
    Category,
    Titles,
    SubCategoryList,
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
    moPrefix: {
      type: String,
      required: false,
    },
    groupData: {
      type: Object,
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

    const loginVisible = ref(false);
    const isCheckingOut = ref(false);
    const waitForUser = ref(false);
    const noAvailableTime = ref(false);

    const orders = ref({});
    const cartItems = ref({});
    const selectedOptions = ref({});
    const selectedOptionsPrev = ref({}); // from the store.cart

    const howtoreceive = ref("takeout");
    const store = ctx.root.$store;

    const multiple = store.getters.stripeRegion.multiple;

    const isInMo = useIsInMo(ctx.root);

    onMounted(() => {
      // Check if we came here as the result of "Edit Items"
      if (store.state.carts[restaurantId.value]) {
        const cart = store.state.carts[restaurantId.value] || {};
        //console.log("cart", cart);
        orders.value = cart.orders || {};
        cartItems.value = cart.cartItems || {};
        selectedOptionsPrev.value = cart.options || {};
        selectedOptions.value = cart.options || {};
      }
    });

    const { category, subCategory, watchCat, hasCategory } =
      useCategoryParams(ctx);

    const restaurantId = computed(() => {
      return ctx.root.$route.params.restaurantId;
    });
    const menuId = computed(() => {
      return ctx.root.$route.params.menuId;
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

    const isDelivery = computed(() => {
      return howtoreceive.value === "delivery";
    });

    const coverImage = computed(() => {
      return (
        (props.shopInfo?.images?.cover?.resizedImages || {})["1200"] ||
        props.shopInfo.restCoverPhoto
      );
    });

    const { loadMenu, menus, menuObj } = useMenu(
      restaurantId,
      isInMo,
      category,
      subCategory,
      props.groupData
    );

    loadMenu();

    watch(menus, (values) => {
      analyticsUtil.sendMenuListView(
        values,
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
      }
    });

    const { loadTitle, titles, titleLists } = useTitles(restaurantId);

    const { loadCategory, categoryData } = useCategory(props.moPrefix);

    const { subCategoryData, loadSubcategory } = useSubcategory(
      props.moPrefix,
      category
    );

    if (isInMo.value) {
      loadCategory();
      if (category.value) {
        loadSubcategory();
      }
    }
    if (!isInMo.value) {
      loadTitle();
    }

    const showCategory = computed(() => {
      return isInMo.value && !subCategory.value;
    });
    const showSubCategory = computed(() => {
      return isInMo.value && subCategory.value;
    });

    const itemLists = computed(() => {
      if (isInMo.value) {
        return menus.value;
      } else {
        const menuLists = props.shopInfo.menuLists || [];
        const itemsObj = array2obj(menus.value.concat(titles.value));
        return menuLists
          .map((itemId) => {
            return { ...itemsObj[itemId] };
          })
          .filter((item) => {
            return item;
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
      );
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

    const didQuantitiesChange = (eventArgs) => {
      // NOTE: We need to assign a new object to trigger computed properties
      cartItems.value[eventArgs.itemId] = menuObj.value[eventArgs.itemId];
      const newObject = { ...orders.value };
      if (arraySum(eventArgs.quantities) > 0) {
        newObject[eventArgs.itemId] = eventArgs.quantities;
      } else {
        delete newObject[eventArgs.itemId];
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
              const menu = Object.assign({}, cartItems.value[menuId]);
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
            path: `/${props.moPrefix}/r/${restaurantId.value}/order/${res.id}`,
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

    watch(user, (newValue) => {
      console.log("user changed");
      if (waitForUser.value && newValue) {
        console.log("handling deferred notification");
        goCheckout();
      }
    });
    const categoryBathPath = computed(() => {
      return `/${props.moPrefix}/r/${restaurantId.value}/cat/${category.value}`;
    });
    const subCategoryKey = computed(() => {
      return showSubCategory.value
        ? [category.value, subCategory.value].join("_")
        : "";
    });

    const {
      value: isOpenGroupCategory,
      toggleOn: openGroupCategory,
      toggleOff: closeGroupCategory,
    } = useToggle(false);
    
    return {
      itemLists,
      titleLists,

      coverImage,
      menuId,

      isOwner,
      isDelivery,
      howtoreceive,

      orders,

      selectedOptionsPrev, // for initial cart status when returning from payment
      selectedOptions, // for initial cart status when switch tab

      totalPrice,
      prices,

      isPreview,

      hasCategory,

      didQuantitiesChange,
      didOptionValuesChange,

      handleCheckOut,
      handleDismissed,

      loginVisible,
      isCheckingOut,
      noAvailableTime,

      showCategory,
      showSubCategory,
      subCategoryKey,

      categoryData,
      subCategoryData,
      categoryBathPath,

      openGroupCategory,
      isOpenGroupCategory,
      
      ...imageUtils(),
    };
  },
});
</script>
