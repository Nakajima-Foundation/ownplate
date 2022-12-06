<template>
  <div>
    <!-- Item Card -->
    <div class="rounded-lg bg-white shadow" :id="`${item.id}`">
      <div class="flow-root cursor-pointer">
        <!-- Image -->
        <div v-if="smallimage" class="pb-2">
          <img
            @click.stop="openImage()"
            :src="smallimage"
            class="w-full rounded-t-lg bg-white object-cover"
            @error="smallImageErrorHandler"
          />
        </div>

        <div class="px-2 sm:px-3 sm:pt-1">
          <!-- Item Name -->
          <a @click.stop="openImage()">
            <div
              class="h-10 text-sm tracking-tight text-black line-clamp-2 sm:h-12 sm:text-base"
            >
              {{ title }}
            </div>
          </a>
          <!-- Price -->
          <div class="mt-1 text-sm font-bold text-black sm:text-base">
            {{ $tc("tax.price", $n(price, "currency")) }}
          </div>
          <div class="text-xs text-black sm:text-sm">
            {{ $t("tax.include") }}
          </div>
        </div>

        <!-- Add / Sold Out Button -->
        <div class="mx-1 mb-1 sm:mx-2 sm:mb-2">
          <div
            v-if="isSoldOut"
            class="mx-1 flex h-9 items-center text-xs font-bold leading-none text-black text-opacity-40 sm:text-sm"
          >
            {{ $t("mobileOrder.soldOut") }}
          </div>
          <div v-else class="flex justify-end">
            <div
              v-if="isPickup"
              class="ml-1 mr-auto flex h-9 items-center text-xs font-bold leading-none text-black sm:text-sm"
            >
              {{ $t("mobileOrder.inStock") }}
            </div>
            <div
              @click.stop="pushQuantities(0)"
              class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-op-teal bg-opacity-10"
              :data-cart-product="item.id"
            >
              <i class="material-icons text-lg text-op-teal">add</i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Popup-->
    <o-modal
      :active.sync="imagePopup"
      :width="488"
      scroll="keep"
      :on-cancel="closeImage"
    >
      <div class="mx-6 rounded-lg bg-white p-5">
        <img
          :src="image"
          class="mx-auto flex h-40 w-40 justify-center rounded-lg object-cover sm:h-72 sm:w-72"
          @error="imageErrorHandler"
        />
        <div class="mt-6 text-left text-xl font-bold text-black">
          {{ title }}
        </div>

        <!-- Description -->
        <div v-if="description !== null" class="mt-3 text-sm">
          <template v-if="!shopInfo.enablePreline">
            {{ description }}
          </template>
          <template v-else>
            <div class="whitespace-pre-line">
              {{ description }}
            </div>
          </template>
        </div>

        <div class="mt-3 flex justify-between">
          <div class="text-left font-bold text-black">
            <Price :shopInfo="shopInfo" :menu="item" />
          </div>
          <div v-if="isPickup">
            <div v-if="isSoldOut" class="font-bold text-black text-opacity-40">
              {{ $t("mobileOrder.soldOut") }}
            </div>
            <div v-else class="font-bold text-black">
              {{ $t("mobileOrder.inStock") }}
            </div>
          </div>
        </div>

        <div class="mt-4 flex">
          <div
            v-if="prices[0] > 0"
            class="flex-1 text-right text-xs text-black"
          >
            {{ $t("sitemenu.subTotal")
            }}<Price
              :shopInfo="shopInfo"
              :menu="{ price: prices[0], tax: item.tax }"
            />
          </div>
        </div>

        <div v-if="isSoldOut" class="-mb-3"></div>

        <div v-else class="mt-1 flex items-center">
          <div>
            <a
              @click="pullQuantities(0)"
              class="removeCart inline-flex h-9 w-24 items-center justify-center rounded-full bg-red-700 bg-opacity-10"
              :disabled="quantities[0] === 0"
              :data-cart-product="item.id"
            >
              <i class="material-icons text-lg text-red-700">remove</i>
            </a>
          </div>
          <div class="flex-1 text-center text-3xl text-op-teal">
            {{ quantities[0] }}
          </div>
          <div>
            <a
              @click="pushQuantities(0)"
              class="cardAdd inline-flex h-9 w-24 items-center justify-center rounded-full bg-op-teal bg-opacity-10"
              :data-cart-product="item.id"
            >
              <i class="material-icons text-lg text-op-teal">add</i>
            </a>
          </div>
        </div>
      </div>
    </o-modal>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  watch,
  computed,
  onMounted,
} from "@vue/composition-api";

import Price from "@/components/Price.vue";
import SharePopup from "@/app/user/Restaurant/SharePopup.vue";
import * as analyticsUtil from "@/lib/firebase/analytics";
import { daysOfWeek } from "@/config/constant";

import {
  useBasePath,
  arraySum,
  itemOptionCheckbox2options,
  scrollToElementById,
  useIsInMo,
  smallImageErrorHandler,
  imageErrorHandler,
  priceWithTax,
} from "@/utils/utils";

// menu UI algorithm
//   init quantities = [0]
//   if sum(quantities) > 0, show button
//   if button push, quantities.push(1)
//   when update quantities, if there is 0 element in quantities and quantities.size > 0, filter 0 element in quantities.

export default defineComponent({
  components: {
    Price,
    SharePopup,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    shopInfo: {
      type: Object,
      required: true,
    },
    menuPickupData: {
      type: Object,
      required: true,
    },
    quantities: {
      type: Array,
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
    menuLinkBathPath: {
      type: String,
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
    isPickup: {
      type: Boolean,
      required: true,
    },
    moSoldOutData: {
      type: Object,
      required: true,
    },
  },
  emits: ["didOrderdChange"],
  setup(props, ctx) {
    const openMenuFlag = ref(props.initialOpenMenuFlag);
    const imagePopup = ref(false);
    const isInMo = useIsInMo(ctx.root);
    const urlSuffix =
      (isInMo.value ? props.menuLinkBathPath : "") + "/menus/" + props.item.id;
    const restaurantId = ctx.root.$route.params.restaurantId;

    const basePath = useBasePath(ctx.root);

    const isSoldOut = computed(() => {
      // preOrder always stock
      if (isInMo.value && !props.isPickup) {
        return false;
      }
      const moPickupStock =
        !props.isPickup ||
        !!props.moSoldOutData.forcePickupStock ||
        !!props.moSoldOutData.isStock;
      return !!props.item.soldOut || !moPickupStock;
    });
    const totalQuantity = computed(() => {
      return arraySum(props.quantities);
    });
    const allergens = computed(() => {
      if (props.item.allergens) {
        return ctx.root.$store.getters.stripeRegion.allergens.filter(
          (allergen) => {
            return props.item.allergens[allergen];
          }
        );
      }
      return [];
    });

    const allergensDescription = computed(() => {
      return (
        ctx.root.$t("allergens.title") +
        ": " +
        allergens.value
          .map((allergen) => {
            return ctx.root.$t(`allergens.${allergen}`);
          })
          .join(ctx.root.$t("comma"))
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
      return options.value.map((option, index) => {
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
    const price = computed(() => {
      return priceWithTax(props.shopInfo, props.item);
    });

    watch(openMenuFlag, () => {
      if (openMenuFlag.value) {
        analyticsUtil.sendViewItem(props.item, props.shopInfo, restaurantId);
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
      if (props.mode !== "mo") {
        const current = ctx.root.$router.history.current.path;
        const to = basePath.value + "/r/" + restaurantId + (urlSuffix || "");
        if (current !== to) {
          ctx.root.$router.replace(to);
        }
      }
      analyticsUtil.sendViewItem(props.item, props.shopInfo, restaurantId);
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
      if (props.mode !== "mo") {
        ctx.root.$router.replace(basePath.value + "/r/" + restaurantId);
      }
    };
    const setQuantities = (key, newValue) => {
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
    const toggleMenuFlag = () => {
      openMenuFlag.value = !openMenuFlag.value;
      if (openMenuFlag.value) {
        analyticsUtil.sendSelectItem(props.item, props.shopInfo, restaurantId);
      }
    };
    const pullQuantities = (key) => {
      if (props.quantities[key] <= 0) {
        return;
      }
      setQuantities(key, props.quantities[key] - 1);
      analyticsUtil.sendRemoveFromCart(
        props.item,
        props.shopInfo,
        restaurantId,
        1
      );
    };
    const pushQuantities = (key) => {
      setQuantities(key, props.quantities[key] + 1);
      if (!openMenuFlag.value) {
        toggleMenuFlag();
      }
      analyticsUtil.sendAddToCart(props.item, props.shopInfo, restaurantId, 1);
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

      smallImageErrorHandler,
      imageErrorHandler,

      price,
    };
  },
});
</script>
