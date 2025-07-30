<template>
  <div>
    <!-- Item Card -->
    <div
      class="rounded-lg bg-white shadow-sm"
      :class="totalQuantity > 0 ? 'border-op-teal border-2' : ''"
    >
      <div @click="toggleMenuFlag()" class="flow-root cursor-pointer">
        <div class="float-right w-48 p-4">
          <!-- Image -->
          <div v-if="smallimage" class="pb-2 text-center">
            <img
              @click.stop="openImage()"
              :src="smallimage"
              class="h-36 w-36 rounded-sm object-cover"
              @error="smallImageErrorHandler"
            />
          </div>

          <!-- Add / Sold Out Button -->
          <div class="w-full">
            <div
              v-if="isSoldOut"
              class="m-auto flex h-9 w-24 items-center justify-center rounded-full bg-red-700/10"
            >
              <div class="text-sm font-bold text-red-700">
                {{ $t("sitemenu.soldOut") }}
              </div>
            </div>
            <div
              v-else
              @click.stop="pushQuantities(0)"
              class="cardAdd bg-op-teal/10 m-auto flex h-9 w-36 items-center justify-center rounded-full"
              :data-cart-product="item.id"
            >
              <div class="text-op-teal text-sm font-bold">
                {{ $t("sitemenu.add") }}
              </div>
            </div>
          </div>
          <div v-if="isSoldOutToday && !isSoldOut" class="w-full">
            <div
              class="mx-auto mt-2 w-36 rounded-full bg-red-100 text-center text-sm font-bold text-red-600"
            >
              {{ $t("sitemenu.soldOutToday") }}
            </div>
          </div>
          <div v-if="false" class="mt-2 text-xs">
            {{ $t("sitemenu.pickupAvailableAfterToday") }}
          </div>
        </div>

        <div class="p-4">
          <!-- Item Name -->
          <a :id="`${item.id}`">
            <div class="align-middle text-base font-bold">
              {{ title }}
              <template v-if="shopInfo.enableLunchDinner">
                /
                <LunchDinnerIcon :item="item" />
              </template>
            </div>
          </a>
          <!-- Price -->
          <div class="mt-2 text-base">
            <Price :shopInfo="shopInfo" :menu="item" />
          </div>

          <!-- Description -->
          <div v-if="description !== null" class="mt-2 text-sm">
            <template v-if="!shopInfo.enablePreline">
              {{ description }}
            </template>
            <template v-else>
              <div v-if="openMenuFlag" class="whitespace-pre-line">
                {{ description }}
              </div>
              <template v-else> {{ descriptionOneLine }}... </template>
            </template>
          </div>

          <!-- Allergens -->
          <div
            v-if="allergens.length > 0"
            class="mt-2 text-xs font-bold text-neutral-600"
          >
            {{ allergensDescription }}
          </div>
        </div>

        <!-- ToDo [画像複数対応の場合] 以下のテキスト+アイコンを表示 -->
        <div v-if="false">
          <div
            v-if="!openMenuFlag"
            class="mb-4 flex items-center justify-center text-center text-xs font-bold text-black/40"
          >
            {{ $t("sitemenu.openCollapse") }}
            <i class="material-icons">expand_more</i>
          </div>
        </div>
      </div>

      <div class="p-4" v-if="menuPickupData.hasExceptData">
        <div class="rounded-lg bg-black/5 p-4">
          <div v-if="menuPickupData.hasExceptDay">
            &#8251;
            <span
              v-for="(day, k) in menuPickupData.menuAvailableDays"
              :key="k"
              class="font-bold"
              >{{ $t("week.short." + daysOfWeek[day])
              }}<span v-if="k !== menuPickupData.menuAvailableDays.length - 1"
                >・</span
              >
            </span>
            {{ $t("sitemenu.limitedSale") }}
          </div>
          <div v-if="menuPickupData.hasExceptHour">
            &#8251; {{ $t("sitemenu.unavailableTime") }}:
            <span class="font-bold"
              >{{ num2time(menuPickupData.exceptHour.start) }} ~
              {{ num2time(menuPickupData.exceptHour.end) }}</span
            >
          </div>
        </div>
      </div>

      <!-- Item Order Details -->
      <div v-if="openMenuFlag">
        <!-- ToDo [画像複数対応の場合] 横スクロールできる複数画像を表示 -->
        <div v-if="false">
          <div class="mb-2 flex space-x-2 overflow-x-auto px-4">
            <div class="flex-none">
              <img
                @click.stop="openImage()"
                :src="smallimage"
                class="h-28 w-28 rounded-sm object-cover sm:h-40 sm:w-40"
                @error="smallImageErrorHandler"
              />
            </div>
            <div class="flex-none">
              <img
                @click.stop="openImage()"
                :src="smallimage"
                class="h-28 w-28 rounded-sm object-cover sm:h-40 sm:w-40"
                @error="smallImageErrorHandler"
              />
            </div>
            <div class="flex-none">
              <img
                @click.stop="openImage()"
                :src="smallimage"
                class="h-28 w-28 rounded-sm object-cover sm:h-40 sm:w-40"
                @error="smallImageErrorHandler"
              />
            </div>
            <div class="flex-none">
              <img
                @click.stop="openImage()"
                :src="smallimage"
                class="h-28 w-28 rounded-sm object-cover sm:h-40 sm:w-40"
                @error="smallImageErrorHandler"
              />
            </div>
            <div class="flex-none">
              <img
                @click.stop="openImage()"
                :src="smallimage"
                class="h-28 w-28 rounded-sm object-cover sm:h-40 sm:w-40"
                @error="smallImageErrorHandler"
              />
            </div>
          </div>
        </div>
        <div class="mx-4 mt-0 border-t-2 border-solid border-black/10 pb-4">
          <!-- Share Button -->
          <div class="mt-2 text-center">
            <share-popup
              :shopInfo="shopInfo"
              :mode="mode"
              :suffix="urlSuffix"
              :isMenu="true"
            ></share-popup>
          </div>

          <!-- Item Options -->
          <template
            v-for="(value, quantityKey) in quantities"
            :key="quantityKey"
          >
            <div v-if="hasOptions">
              <div class="text-xs">
                {{ $t("sitemenu.options") }}
              </div>
              <div class="mt-2 grid grid-cols-1 space-y-2">
                <div
                  v-for="(option, index) in options"
                  :key="index"
                  class="rounded-lg bg-black/5 p-4"
                >
                  <div v-if="option.length === 1" class="field">
                    <t-checkbox
                      :modelValue="selectedOptions[quantityKey][index]"
                      @update:modelValue="
                        updateSelectedOptions(quantityKey, index, $event)
                      "
                      ><div class="text-sm font-bold">
                        {{ displayOption(option[0], shopInfo, item) }}
                      </div></t-checkbox
                    >
                  </div>
                  <div v-else class="field grid grid-cols-1 gap-y-2">
                    <div
                      v-for="(choice, index2) in option"
                      :key="`${quantityKey}_${index2}`"
                    >
                      <input
                        type="radio"
                        :modelValue="selectedOptions[quantityKey][index]"
                        @change="
                          updateSelectedOptions(
                            quantityKey,
                            index,
                            $event.target.value,
                          )
                        "
                        :name="`${item.id}_${quantityKey}_${index}`"
                        :value="index2"
                      /><span class="ml-2 text-sm font-bold">
                        {{ displayOption(choice, shopInfo, item) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Item Quantity / Sold Out -->
            <div class="mt-4">
              <div v-if="isSoldOut">
                <div
                  class="flex h-9 items-center justify-center rounded-full bg-red-700/10"
                >
                  <div class="text-sm font-bold text-red-700">
                    {{ $t("sitemenu.soldOut") }}
                  </div>
                </div>
              </div>

              <div v-else>
                <div>
                  <div class="flex">
                    <div class="text-xs">
                      {{ $t("sitemenu.quantity") }}
                    </div>
                    <div
                      v-if="prices[quantityKey] > 0"
                      class="flex-1 text-right text-xs"
                    >
                      {{ $t("sitemenu.subTotal")
                      }}<Price
                        :shopInfo="shopInfo"
                        :menu="{ price: prices[quantityKey], tax: item.tax }"
                      />
                    </div>
                  </div>
                  <div></div>
                </div>

                <div class="mt-2 flex items-center">
                  <div>
                    <a
                      @click="pullQuantities(quantityKey)"
                      class="removeCart inline-flex h-9 w-24 cursor-pointer items-center justify-center rounded-full bg-red-700/10"
                      :disabled="quantities[quantityKey] === 0"
                      :data-cart-product="item.id"
                    >
                      <i class="material-icons text-lg text-red-700">remove</i>
                    </a>
                  </div>
                  <div class="text-op-teal flex-1 text-center text-3xl">
                    {{ quantities[quantityKey] }}
                  </div>
                  <div>
                    <a
                      @click="pushQuantities(quantityKey)"
                      class="cardAdd bg-op-teal/10 inline-flex h-9 w-24 cursor-pointer items-center justify-center rounded-full"
                      :data-cart-product="item.id"
                    >
                      <i class="material-icons text-op-teal text-lg">add</i>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="mt-4 border-t-2 border-solid border-black/10 pb-4"
              v-if="showMoreOption"
            ></div>
          </template>

          <!-- Another Order with Different Options -->
          <div>
            <!-- # Enable this section If "hasOptions" and more than one order in the default section above. -->
            <!-- # Show only "Add Another Order Button" first, then add "Another Order" section with the item quantities +1 when the button tapped.  -->
            <!-- # Once user removed the item to quantities 0, the "Another Order" section will be removed. -->

            <!-- Add Another Order Button -->
            <div v-if="showMoreOption">
              <div class="text-center">
                <a
                  @click="pushItem"
                  class="inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
                >
                  <i class="material-icons text-op-teal mr-2 text-lg">add</i>
                  <span class="text-op-teal text-sm font-bold">{{
                    $t("sitemenu.addDifferentOptionsItem")
                  }}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Popup-->
    <t-modal
      v-model:active="imagePopup"
      width="488"
      scroll="keep"
      @dismissed="closeImage"
    >
      <div class="rounded-lg bg-white p-5 sm:mx-6">
        <img
          :src="image"
          class="rounded-lg shadow-lg"
          @error="imageErrorHandler"
        />

        <!-- ToDo [画像複数対応の場合] 切り替え拡大表示できるサムネイル一覧 -->
        <div v-if="false">
          <div class="mt-4 flex justify-center space-x-4">
            <img
              :src="image"
              class="h-12 w-12 rounded-sm object-cover shadow-lg"
              @error="imageErrorHandler"
            />
            <img
              :src="image"
              class="h-12 w-12 rounded-sm object-cover shadow-lg"
              @error="imageErrorHandler"
            />
            <img
              :src="image"
              class="h-12 w-12 rounded-sm object-cover shadow-lg"
              @error="imageErrorHandler"
            />
            <img
              :src="image"
              class="h-12 w-12 rounded-sm object-cover shadow-lg"
              @error="imageErrorHandler"
            />
            <img
              :src="image"
              class="h-12 w-12 rounded-sm object-cover shadow-lg"
              @error="imageErrorHandler"
            />
          </div>
        </div>
        <div class="mt-2 text-left text-xl font-bold text-black">
          {{ title }}
        </div>
        <div class="mt-3 flex justify-between">
          <div class="text-left font-bold text-black">
            <Price :shopInfo="shopInfo" :menu="item" />
          </div>
        </div>

        <div v-if="isSoldOut" class="-mb-3"></div>

        <div v-else class="mt-1 flex items-center">
          <div>
            <a
              @click="pullQuantities(0)"
              class="removeCart inline-flex h-9 w-24 items-center justify-center rounded-full bg-red-700/10"
              :disabled="quantities[0] === 0"
              :data-cart-product="item.id"
            >
              <i class="material-icons text-lg text-red-700">remove</i>
            </a>
          </div>
          <div class="text-op-teal flex-1 text-center text-3xl">
            {{ quantities[0] }}
          </div>
          <div>
            <a
              @click="pushQuantities(0)"
              class="cardAdd bg-op-teal/10 inline-flex h-9 w-24 items-center justify-center rounded-full"
              :data-cart-product="item.id"
            >
              <i class="material-icons text-op-teal text-lg">add</i>
            </a>
          </div>
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
  onMounted,
  PropType,
} from "vue";

import Price from "@/components/Price.vue";
import SharePopup from "@/app/user/Restaurant/SharePopup.vue";
import LunchDinnerIcon from "@/app/user/Restaurant/LunchDinnerIcon.vue";

import * as analyticsUtil from "@/lib/firebase/analytics";
import { daysOfWeek } from "@/config/constant";

import {
  useBasePath,
  arraySum,
  itemOptionCheckbox2options,
  scrollToElementById,
  smallImageErrorHandler,
  imageErrorHandler,
  num2time,
  displayOption,
} from "@/utils/utils";

import moment from "moment-timezone";

// menu UI algorithm
//   init quantities = [0]
//   if sum(quantities) > 0, show button
//   if button push, quantities.push(1)
//   when update quantities, if there is 0 element in quantities and quantities.size > 0, filter 0 element in quantities.

import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import { AnalyticsMenuData } from "@/lib/firebase/analytics";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { MenuData } from "@/models/menu";

export default defineComponent({
  components: {
    Price,
    SharePopup,
    LunchDinnerIcon,
  },
  props: {
    item: {
      type: Object as PropType<MenuData>,
      required: true,
    },
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
    menuPickupData: {
      type: Object,
      required: true,
    },
    quantities: {
      type: Array<number>,
      required: true,
    },
    selectedOptions: {
      type: Array,
      required: false,
    },
    initialOpenMenuFlag: {
      type: Boolean,
      required: true,
    },
    isOpen: {
      type: Boolean,
      required: true,
    },
    prices: {
      type: Array,
      required: true,
    },
    mode: {
      type: String,
      required: true,
    },
  },
  emits: ["didOrderdChange", "updateSelectedOptions"],
  setup(props, ctx) {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    const { t } = useI18n({ useScope: "global" });

    const openMenuFlag = ref(props.initialOpenMenuFlag);
    const imagePopup = ref(false);
    const urlSuffix = "/menus/" + props.item.id;
    const restaurantId = route.params.restaurantId as string;

    const basePath = useBasePath();

    const isSoldOut = computed(() => {
      return !!props.item.soldOut;
    });
    const isSoldOutToday = computed(() => {
      const today = moment(store.state.date).format("YYYY-MM-DD");
      return props.item.soldOutToday === today;
    });
    const totalQuantity = computed(() => {
      return arraySum(props.quantities);
    });
    const allergens = computed(() => {
      if (props.item.allergens) {
        return store.getters.stripeRegion.allergens.filter(
          (allergen: string) => {
            return props.item.allergens[allergen];
          },
        );
      }
      return [];
    });

    const allergensDescription = computed(() => {
      return (
        t("allergens.title") +
        ": " +
        allergens.value
          .map((allergen: string) => {
            return t(`allergens.${allergen}`);
          })
          .join(t("comma"))
      );
    });
    const options = computed(() => {
      return itemOptionCheckbox2options(props.item.itemOptionCheckbox);
    });
    const hasOptions = computed(() => {
      return options.value.length;
    });
    const showMoreOption = computed(() => {
      return totalQuantity.value > 0 && hasOptions.value;
    });
    const defaultOpions = computed(() => {
      return options.value.map((option) => {
        return option.length === 1 ? false : 0;
      });
    });
    const image = computed(() => {
      return (
        (props.item?.images?.item?.resizedImages || {})["600"] ||
        props.item.itemPhoto
      );
    });
    const smallimage = computed(() => {
      return (
        (props.item?.images?.item?.resizedImages || {})["100"] ||
        (props.item?.images?.item?.resizedImages || {})["600"] ||
        props.item.itemPhoto
      );
    });
    const title = computed(() => {
      return props.item.itemName;
    });
    const description = computed(() => {
      return props.item.itemDescription;
    });
    const descriptionOneLine = computed(() => {
      return (props.item.itemDescription || "").split(/\r?\n/)[0];
    });

    watch(openMenuFlag, () => {
      if (openMenuFlag.value) {
        analyticsUtil.sendViewItem(
          props.item as AnalyticsMenuData,
          props.shopInfo,
          restaurantId,
        );
      }
    });
    // TODO: improve to set default value.
    if (props.selectedOptions === undefined) {
      const newOpt = [...defaultOpions.value];
      ctx.emit("didOrderdChange", {
        itemId: props.item.id,
        optionValues: [newOpt],
      });
    }

    const openImage = () => {
      scrollToElementById(props.item.id);
      imagePopup.value = true;

      // TODO confirm 2023-01
      const current = router.currentRoute.path;

      const to = basePath.value + "/r/" + restaurantId + (urlSuffix || "");
      if (current !== to) {
        router.replace(to);
      }
      analyticsUtil.sendViewItem(
        props.item as AnalyticsMenuData,
        props.shopInfo,
        restaurantId,
      );
    };
    onMounted(() => {
      if (props.isOpen) {
        openImage();
      }
    });
    const closeImage = () => {
      imagePopup.value = false;
      setTimeout(() => {
        scrollToElementById(props.item.id);
      }, 30);
      router.replace(basePath.value + "/r/" + restaurantId);
    };
    const setQuantities = (key: number, newValue: number) => {
      const newQuantities = [...props.quantities];
      newQuantities[key] = newValue;
      const newSelectedOptions = [...props.selectedOptions];
      if (newQuantities[key] === 0 && newQuantities.length > 1) {
        newQuantities.splice(key, 1);
        newSelectedOptions.splice(key, 1);
      }
      ctx.emit("didOrderdChange", {
        itemId: props.item.id,
        quantities: newQuantities,
        optionValues: newSelectedOptions,
      });
    };
    const updateSelectedOptions = (
      quantityKey: number,
      index: number,
      e: boolean | string,
    ) => {
      const newSelectedOptions = [...props.selectedOptions];
      newSelectedOptions[quantityKey][index] = e;
      ctx.emit("updateSelectedOptions", newSelectedOptions);
    };
    const toggleMenuFlag = () => {
      openMenuFlag.value = !openMenuFlag.value;
      if (openMenuFlag.value) {
        analyticsUtil.sendSelectItem(
          props.item as AnalyticsMenuData,
          props.shopInfo,
          restaurantId,
        );
      }
    };
    const pullQuantities = (key: number) => {
      if (props.quantities[key] <= 0) {
        return;
      }
      setQuantities(key, props.quantities[key] - 1);
      analyticsUtil.sendRemoveFromCart(
        props.item as AnalyticsMenuData,
        props.shopInfo,
        restaurantId,
        1,
      );
    };
    const pushQuantities = (key: number) => {
      setQuantities(key, props.quantities[key] + 1);
      if (!openMenuFlag.value) {
        toggleMenuFlag();
      }
      analyticsUtil.sendAddToCart(
        props.item as AnalyticsMenuData,
        props.shopInfo,
        restaurantId,
        1,
      );
    };
    const pushItem = () => {
      const newSelectedOptions = [...props.selectedOptions];
      newSelectedOptions.push([...defaultOpions.value]);

      const newQuantities = [...props.quantities];
      newQuantities.push(1);
      ctx.emit("didOrderdChange", {
        itemId: props.item.id,
        quantities: newQuantities,
        optionValues: newSelectedOptions,
      });
    };

    return {
      openMenuFlag,
      imagePopup,
      urlSuffix,

      daysOfWeek,

      // computed
      isSoldOut,
      isSoldOutToday,
      totalQuantity,
      allergens,
      allergensDescription,
      options,
      hasOptions,
      showMoreOption,
      image,
      smallimage,
      title,
      description,
      descriptionOneLine,

      // methods
      openImage,
      closeImage,
      setQuantities,

      toggleMenuFlag,
      pullQuantities,
      pushQuantities,
      pushItem,
      updateSelectedOptions,

      smallImageErrorHandler,
      imageErrorHandler,

      num2time,
      displayOption,
    };
  },
});
</script>
