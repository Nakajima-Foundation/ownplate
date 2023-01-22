<template>
  <div>
    <template v-if="notFound == null"></template>
    <template v-else-if="notFound">
      <not-found />
    </template>
    <template v-else>
      <!-- Header -->
      <div class="mx-6 mt-6 lg:flex lg:items-center">
        <div class="flex-1"></div>

        <!-- Notifications -->
        <div class="mt-4 flex-shrink-0 text-right lg:mt-0">
          <notification-index :shopInfo="shopInfo" />
        </div>
      </div>

      <!-- Save and Cancel -->
      <div class="mt-6 flex justify-center space-x-4">
        <!-- Cancel Button -->
        <o-button
          class="b-reset-tw"
          tag="router-link"
          :to="`/admin/restaurants/${this.restaurantId()}/menus`"
        >
          <div
            class="inline-flex h-12 items-center rounded-full bg-black bg-opacity-5 px-6"
          >
            <span class="text-base font-bold text-black text-opacity-60">{{
              $t("button.cancel")
            }}</span>
          </div>
        </o-button>

        <!-- Save Button -->
        <o-button @click="submitItem" :disabled="submitting" class="b-reset-tw">
          <div
            class="inline-flex h-12 items-center justify-center rounded-full bg-op-teal px-6 shadow"
            style="min-width: 8rem"
          >
            <span class="text-base font-bold text-white">{{
              $t(
                submitting
                  ? "editCommon.saving"
                  : menuInfo.publicFlag
                  ? "editCommon.save"
                  : "editCommon.saveDraft"
              )
            }}</span>
          </div>
        </o-button>
      </div>

      <!-- Publish Status -->
      <div class="mx-6 mt-6 rounded-lg bg-black bg-opacity-5 p-4 text-center">
        <o-checkbox
          v-model="menuInfo.publicFlag"
          :disabled="hasError"
          :variant="!menuInfo.publicFlag ? 'danger' : ''"
        >
          <div class="font-bold">{{ $t("shopInfo.public") }}</div>
        </o-checkbox>

        <div class="text-sm font-bold">
          <div v-if="hasError" class="mt-1 text-red-700">
            {{ $t("editRestaurant.draftWarning") }}
          </div>
          <div
            class="mt-1 text-red-700"
            v-if="!menuInfo.publicFlag && !hasError"
          >
            {{ $t("editMenu.saveAsDraft") }}
          </div>
        </div>
      </div>

      <!-- Required Note -->
      <div class="mx-6 mt-6 text-sm font-bold text-red-700">
        * {{ $t("editRestaurant.required") }}
      </div>

      <!-- Settings -->
      <div class="mx-6 mt-6 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
        <!-- Left -->
        <div>
          <!-- Item Name -->
          <div>
            <div class="pb-2 text-sm font-bold">
              {{ $t("editMenu.itemName") }}
              <span class="text-red-700">*</span>
            </div>
            <o-field
              :variant="errors['itemName'].length > 0 ? 'danger' : 'success'"
            >
              <o-input
                v-model="menuInfo.itemName"
                :placeholder="$t('editMenu.enterItemName')"
              ></o-input>
            </o-field>
          </div>

          <!-- Item Name -->
          <div class="mt-6">
            <div class="pb-2 text-sm font-bold">
              {{ $t("editMenu.itemAliasesName") }}
            </div>
            <o-input
              v-model="menuInfo.itemAliasesName"
              :placeholder="$t('editMenu.enterItemAliasesName')"
            ></o-input>
          </div>

          <!-- Item Price -->
          <div class="mt-6">
            <div class="pb-2 text-sm font-bold">
              {{ $t("editMenu.price") }}
              <span class="text-red-700">*</span>
            </div>
            <div>
              <o-field
                :variant="errors['price'].length > 0 ? 'danger' : 'success'"
              >
                <o-input
                  v-model="menuInfo.price"
                  type="number"
                  :step="priceStep"
                  placeholder="00.00"
                  :max="maxPrice"
                  min="0.00"
                  expanded
                ></o-input>
                <div>
                  <span class="button is-static">
                    {{ $t("currency." + currencyKey) }}
                  </span>
                </div>
              </o-field>
            </div>
          </div>

          <!-- Item Tax -->
          <div class="mt-6">
            <div class="pb-2 text-sm font-bold">
              {{ $t("editMenu.tax") }}
              <span class="text-red-700">*</span>
            </div>
            <div>
              <o-field
                :variant="errors['tax'].length > 0 ? 'danger' : 'success'"
              >
                <o-select v-model="menuInfo.tax" placeholder="select">
                  <option
                    v-for="taxItem in taxRates"
                    :value="taxItem"
                    :key="taxItem"
                  >
                    {{ shopInfo && (shopInfo[taxItem + "Tax"] || 0) + "%" }}
                    - {{ $t("editMenu." + taxRateKeys[taxItem]) }}
                  </option>
                </o-select>
              </o-field>
            </div>
          </div>

          <!-- Price Example -->
          <div
            v-if="requireTaxPriceDisplay"
            class="mt-6 rounded-lg bg-black bg-opacity-5 p-4"
          >
            <div class="inline text-sm font-bold">
              {{ $t("editMenu.displayPrice") }}:
            </div>
            <div class="inline">
              <Price :shopInfo="shopInfo" :menu="menuInfo" />
            </div>
          </div>

          <!-- Allergens -->
          <div class="mt-6">
            <div class="pb-2 text-sm font-bold">
              {{ $t("allergens.title") }}
            </div>
            <div>
              <o-checkbox
                v-for="allergen in allergens"
                v-model="menuInfo.allergens[allergen]"
                :key="allergen"
                class="mb-2"
                >{{ $t(`allergens.${allergen}`) }}</o-checkbox
              >
            </div>
          </div>

          <!-- Item Description -->
          <div class="mt-6">
            <div class="pb-2 text-sm font-bold">
              {{ $t("editMenu.itemDescription") }}
            </div>
            <div>
              <o-field
                :variant="
                  errors['itemDescription'].length > 0 ? 'danger' : 'success'
                "
              >
                <o-input
                  v-model="menuInfo.itemDescription"
                  type="textarea"
                  :placeholder="$t('editMenu.enterItemDescription')"
                ></o-input>
              </o-field>
            </div>
          </div>

          <!-- Item Memo -->
          <div class="mt-6">
            <div class="pb-2 text-sm font-bold">
              {{ $t("editMenu.itemMemo") }}
            </div>
            <div>
              <o-field variant="success">
                <o-input
                  v-model="menuInfo.itemMemo"
                  type="textarea"
                  :placeholder="$t('editMenu.enterItemMemo')"
                ></o-input>
              </o-field>
            </div>
          </div>
        </div>

        <!-- Right -->
        <div class="mt-6 lg:mt-0">
          <!-- Item Photo -->
          <div>
            <div class="pb-2 text-sm font-bold">
              {{ $t("editMenu.itemPhoto") }}
            </div>
            <div class="flex">
              <!-- Current Photo -->
              <div v-if="itemPhoto" class="mr-4">
                <div>
                  <img
                    class="rounded object-cover"
                    :src="itemPhoto"
                    style="width: 128px; height: 128px"
                    @error="smallImageErrorHandler"
                  />
                </div>
                <div class="mt-1 text-center text-xs">
                  {{ $t("editCommon.current") }}
                </div>
              </div>

              <!-- New Photo -->
              <div class="flex-1">
                <croppa
                  :width="128"
                  :height="128"
                  :prevent-white-space="true"
                  :zoom-speed="5"
                  :accept="'image/jpeg'"
                  :placeholder="$t('editCommon.clickAndUpload')"
                  :placeholder-font-size="13"
                  :disable-drag-to-move="true"
                  :disable-scroll-to-zoom="true"
                  :disable-rotation="true"
                  initial-position="center"
                  :canvas-color="'gainsboro'"
                  :show-remove-button="true"
                  @file-choose="handleMenuImage"
                ></croppa>
                <div class="mt-1 w-32 text-center text-xs">
                  {{ $t("editCommon.new") }}
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="pt-2 text-sm text-black text-opacity-60">
              {{ $t("editCommon.clickAndUploadDetail") }}
            </div>
          </div>

          <!-- Item Options -->
          <div class="mt-6">
            <div class="pb-2 text-sm font-bold">
              {{ $t("editMenu.itemOptions") }}
            </div>

            <div class="pb-2 text-sm">
              {{ $t("editMenu.itemOptionsNote") }}
            </div>

            <!-- Option Settings -->
            <div class="grid-col-1 space-y-4">
              <div v-for="(option, key) in menuInfo.itemOptionCheckbox">
                <div :key="key" class="mb-2 flex">
                  <o-input
                    v-model="menuInfo.itemOptionCheckbox[key]"
                    :placeholder="$t('editMenu.enterItemOption')"
                    class="mr-2 flex-1"
                  />
                  <o-button class="b-reset-tw" @click="deleteOption(key)">
                    <div
                      class="inline-flex h-9 items-center justify-center rounded-full bg-red-700 bg-opacity-10 px-4"
                    >
                      <i class="material-icons text-lg text-red-700">delete</i>
                    </div>
                  </o-button>
                </div>

                <!-- Option Preview -->
                <div class="rounded-lg bg-black bg-opacity-5 p-4">
                  <div
                    class="mb-2 flex text-xs font-bold text-black text-opacity-30"
                  >
                    <div class="flex-1">
                      {{ $t("editMenu.optionsPreview") }}
                    </div>
                    <div>{{ $t("editMenu.priceChange") }}</div>
                  </div>

                  <div v-for="(opt, k) in itemOptions[key]" class="flex">
                    <div class="flex-1">
                      <o-checkbox v-if="itemOptions[key].length == 1" disabled>
                        <div
                          class="text-sm font-bold text-black text-opacity-60"
                        >
                          {{ displayOption(opt, shopInfo, menuInfo) }}
                        </div>
                      </o-checkbox>
                      <o-radio
                        v-else
                        v-model="dummyCheckbox[key]"
                        :native-value="k"
                        disabled
                      >
                        <div
                          class="text-sm font-bold text-black text-opacity-60"
                        >
                          {{ displayOption(opt, shopInfo, menuInfo) }}
                        </div>
                      </o-radio>
                    </div>
                    <div class="text-sm font-bold text-black text-opacity-60">
                      {{ displayOptionPrice(opt) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Add Option -->
            <div class="mt-4">
              <o-button class="b-reset-tw" @click="addOption">
                <div
                  class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
                >
                  <i class="material-icons mr-2 text-lg text-op-teal">add</i>
                  <div class="text-sm font-bold text-op-teal">
                    {{ $t("editMenu.itemAddOption") }}
                  </div>
                </div>
              </o-button>
            </div>
          </div>

          <div class="mt-6">
            <div class="pb-2 text-sm font-bold">
              {{ $t("editMenu.exclusionDate") }}
            </div>
            <span v-for="(day, index) in daysOfWeek" :key="index">
              <o-checkbox v-model="menuInfo.exceptDay[index]">
                <span class="text-base font-bold">
                  {{ $t("week.short." + day) }}
                  <span v-if="index !== '7'">/</span>
                </span>
              </o-checkbox>
            </span>
            <div class="mt-2 text-sm font-bold">
              {{ $t("editMenu.exclusionTime") }}
            </div>
            <div class="mt-2">
              <hours-input
                v-model="menuInfo.exceptHour"
                variant="success"
                :disabled="false"
              ></hours-input>
            </div>
          </div>

          <!-- CSV Categories -->
          <div class="mt-6">
            <div class="pb-2 text-sm font-bold">
              {{ $t("editMenu.csvCategories") }}
            </div>

            <div class="pb-2 text-sm">
              {{ $t("editMenu.csvCategoriesNote") }}
            </div>

            <div
              class="grid-cols-1 space-y-4 rounded-lg bg-black bg-opacity-5 p-4"
            >
              <!-- Category 1 -->
              <div>
                <div class="mb-2 flex items-center">
                  <div
                    class="flex-1 text-sm font-bold text-black text-opacity-60"
                  >
                    {{ $t("editMenu.category1") }}
                  </div>
                  <div>
                    <o-button
                      class="b-reset-tw"
                      @click="editCategory('category1')"
                    >
                      <div class="inline-flex items-center justify-center">
                        <div class="text-sm font-bold text-op-teal">
                          {{ $t("editMenu.editCategory1") }}
                        </div>
                      </div>
                    </o-button>
                  </div>
                </div>

                <o-select
                  v-if="categories1.length > 0"
                  v-model="menuInfo.category1"
                  expanded
                >
                  <option
                    v-for="category in categories1"
                    :key="category"
                    :value="category"
                  >
                    {{ category }}
                  </option>
                </o-select>
              </div>

              <!-- Category 2 -->
              <div>
                <div class="mb-2 flex items-center">
                  <div
                    class="flex-1 text-sm font-bold text-black text-opacity-60"
                  >
                    {{ $t("editMenu.category2") }}
                  </div>
                  <div>
                    <o-button
                      class="b-reset-tw"
                      @click="editCategory('category2')"
                    >
                      <div class="inline-flex items-center justify-center">
                        <div class="text-sm font-bold text-op-teal">
                          {{ $t("editMenu.editCategory2") }}
                        </div>
                      </div>
                    </o-button>
                  </div>
                </div>

                <o-select
                  v-if="categories2.length > 0"
                  v-model="menuInfo.category2"
                  expanded
                >
                  <option
                    v-for="category in categories2"
                    :key="category"
                    :value="category"
                  >
                    {{ category }}
                  </option>
                </o-select>
              </div>

              <!-- Category Edit Popup -->
              <edit-category
                v-if="categoryKey"
                :categoryKey="categoryKey"
                :shopInfo="shopInfo"
                @dismissed="handleDismissed"
                @updated="handleCategoryUpdated"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Publish Status -->
      <div class="mx-6 mt-6 rounded-lg bg-black bg-opacity-5 p-4 text-center">
        <o-checkbox
          v-model="menuInfo.publicFlag"
          :disabled="hasError"
          :variant="!menuInfo.publicFlag ? 'danger' : ''"
        >
          <div class="font-bold">{{ $t("shopInfo.public") }}</div>
        </o-checkbox>

        <div class="mt-1 text-sm font-bold">
          <div v-if="hasError" class="text-red-700">
            {{ $t("editRestaurant.draftWarning") }}
          </div>
          <div class="text-red-700" v-if="!menuInfo.publicFlag && !hasError">
            {{ $t("editMenu.saveAsDraft") }}
          </div>
        </div>
      </div>

      <!-- Save and Cancel -->
      <div class="mt-6 flex justify-center space-x-4">
        <!-- Cancel Button -->
        <o-button
          class="b-reset-tw"
          tag="router-link"
          :to="`/admin/restaurants/${this.restaurantId()}/menus`"
        >
          <div
            class="inline-flex h-12 items-center rounded-full bg-black bg-opacity-5 px-6"
          >
            <span class="text-base font-bold text-black text-opacity-60">{{
              $t("button.cancel")
            }}</span>
          </div>
        </o-button>

        <!-- Save Button -->
        <o-button @click="submitItem" :disabled="submitting" class="b-reset-tw">
          <div
            class="inline-flex h-12 items-center justify-center rounded-full bg-op-teal px-6 shadow"
            style="min-width: 8rem"
          >
            <span class="text-base font-bold text-white">{{
              $t(
                submitting
                  ? "editCommon.saving"
                  : menuInfo.publicFlag
                  ? "editCommon.save"
                  : "editCommon.saveDraft"
              )
            }}</span>
          </div>
        </o-button>
      </div>

      <!-- Copy -->
      <div class="mx-6 mt-6 text-center lg:mx-auto lg:max-w-sm">
        <div>
          <o-button @click="copyItem" :disabled="submitting" class="b-reset-tw">
            <div
              class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons mr-2 text-lg text-op-teal"> queue </i>
              <span class="text-sm font-bold text-op-teal">{{
                $t(isInMo ? "mobileOrder.copyMenu" : "editCommon.copyMenu")
              }}</span>
            </div>
          </o-button>
        </div>

        <div class="mt-4">
          <o-select v-model="copyRestaurantId" expanded>
            <option
              v-for="restaurant in restaurants"
              :key="restaurant.id"
              :value="restaurant.id"
            >
              {{ restaurant.restaurantName }}
            </option>
          </o-select>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  computed,
  onUnmounted,
  reactive,
} from "vue";
import { db } from "@/plugins/firebase";
import firebase from "firebase/compat/app";

import NotFound from "@/components/NotFound.vue";
import BackButton from "@/components/BackButton.vue";
import Price from "@/components/Price.vue";
import EditCategory from "@/app/admin/MenuItemPage/EditCategory.vue";
import NotificationIndex from "./Notifications/Index.vue";
import HoursInput from "@/app/admin/inputComponents/HoursInput.vue";

import { taxRates, daysOfWeek } from "@/config/constant";
import { ownPlateConfig } from "@/config/project";
import { halfCharactors, formatOption, optionPrice } from "@/utils/strings";
import {
  doc2data,
  useAdminUids,
  regionalSetting,
  stripeRegion,
  countObj,
  roundPrice,
  taxRate,
  notFoundResponse,
  smallImageErrorHandler,
} from "@/utils/utils";

import { uploadFile } from "@/lib/firebase/storage";

import { getNewItemData } from "@/models/menu";
import { checkShopOwner } from "@/utils/userPermission";

import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "MenuItemPage",
  metaInfo() {
    return {
      title:
        this.menuInfo && this.menuInfo.itemName
          ? [
              "Admin Menu Item",
              this.menuInfo.itemName,
              this.shopInfo.restaurantName,
              this.defaultTitle,
            ].join(" / ")
          : this.defaultTitle,
    };
  },

  components: {
    Price,
    EditCategory,
    BackButton,
    NotificationIndex,
    NotFound,
    HoursInput,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    groupMasterRestaurant: {
      type: Object,
      required: false,
    },
    isInMo: {
      type: Boolean,
      required: true,
    },
  },

  setup(props, ctx) {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n({ useScope: 'global' });

    const dummyCheckbox = ref([]);

    const menuInfo = reactive({
      itemName: "",
      itemAliasesName: "",
      price: 0,
      tax: "food",
      itemDescription: "",
      itemMemo: "",
      itemPhoto: "",
      images: {},
      publicFlag: false,
      itemOptionCheckbox: [""],
      allergens: {},
      exceptDay: {},
      exceptHour: {},
      category1: "",
      category2: "",
    });

    const maxPrice = 1000000.0 / stripeRegion.multiple;
    const allergens = stripeRegion.allergens;
    const priceStep = 1.0 / stripeRegion.multiple;

    const notFound = ref(null);
    const menuId = route.params.menuId;
    const submitting = ref(false);

    const files = {};
    const categoryKey = ref(null);
    const restaurants = ref([]);
    const copyRestaurantId = ref(null);

    const { uid } = useAdminUids();

    // allow sub Account
    if (!checkShopOwner(props.shopInfo, uid.value)) {
      return notFoundResponse;
    }
    const menuRestaurantId = computed(() => {
      return props.isInMo
        ? props.groupMasterRestaurant.restaurantId
        : route.params.restaurantId;
    });

    const taxRateKeys = regionalSetting["taxRateKeys"];
    const requireTaxPriceDisplay = regionalSetting.requireTaxPriceDisplay;
    const currencyKey = regionalSetting["CurrencyKey"];

    if (!props.shopInfo.category1) {
      props.shopInfo.category1 = [];
    }
    if (!props.shopInfo.category2) {
      props.shopInfo.category2 = [];
    }
    const { restaurantId } = props.shopInfo;
    db.doc(`restaurants/${menuRestaurantId.value}/menus/${menuId}`)
      .get()
      .then((menuInfoDoc) => {
        if (menuInfoDoc.exists) {
          Object.assign(menuInfo, menuInfoDoc.data());
          notFound.value = false;
        } else {
          notFound.value = true;
        }
      });

    db.collection("restaurants")
      .where("uid", "==", uid.value)
      .where("deletedFlag", "==", false)
      .get()
      .then((restaurantsCollection) => {
        if (
          !restaurantsCollection.empty &&
          restaurantsCollection.docs.length > 0
        ) {
          restaurants.value = restaurantsCollection.docs.map((r) =>
            doc2data("r")(r)
          );
          copyRestaurantId.value = restaurants.value[0].id;
        }
      });

    const itemOptions = computed(() => {
      return menuInfo.itemOptionCheckbox.map((v) => {
        return v.split(",");
      });
    });

    const categories1 = computed(() => {
      return props.shopInfo.category1 || [];
    });
    const categories2 = computed(() => {
      return props.shopInfo.category2 || [];
    });
    const itemPhoto = computed(() => {
      return (
        (menuInfo?.images?.item?.resizedImages || {})["600"] ||
        menuInfo.itemPhoto
      );
    });

    const errors = computed(() => {
      const err = {};
      ["itemName", "price", "tax"].forEach((name) => {
        err[name] = [];
        if (menuInfo[name] === "") {
          err[name].push("validationError." + name + ".empty");
        }
      });
      err["itemDescription"] = [];
      return err;
    });
    const hasError = computed(() => {
      return countObj(errors.value) > 0;
    });

    const displayOptionPrice = (str) => {
      const price = roundPrice(
        optionPrice(str) * taxRate(props.shopInfo, menuInfo)
      );
      if (price === 0) {
        return t("editMenu.noPriceChange");
      } else if (price > 0) {
        return "+" + n(price, "currency");
      }
      return n(price, "currency");
    };
    const handleCategoryUpdated = async (categories) => {
      await db.doc(`restaurants/${menuRestaurantId.value}`).update({
        [categoryKey.value]: categories,
      });
      props.shopInfo[categoryKey.value] = categories;
    };
    const handleDismissed = () => {
      categoryKey.value = null;
    };
    const editCategory = (key) => {
      categoryKey.value = key;
    };
    const handleMenuImage = (e) => {
      files["menu"] = e;
    };
    const deleteOption = (pos) => {
      menuInfo.itemOptionCheckbox.splice(pos, 1);
      // console.log(e);
    };
    const addOption = () => {
      menuInfo.itemOptionCheckbox.push("");
    };
    const newItemData = () => {
      const itemData = getNewItemData(
        menuInfo,
        ownPlateConfig.region === "JP",
        !hasError.value
      );
      return itemData;
    };
    const copyItem = () => {
      if (copyRestaurantId.value !== null) {
        const shop = restaurants.value.find(
          (r) => r.id === copyRestaurantId.value
        );
        store.commit("setAlert", {
          title: shop.restaurantName,
          code: props.isInMo
            ? "mobileOrder.copyMenuAlert"
            : "editCommon.copyMenuAlert",
          callback: async () => {
            const newItem = newItemData();
            newItem.publicFlag = false;
            newItem.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            newItem.deletedFlag = false;
            newItem.uid = store.getters.uidAdmin;

            const category1 = shop.category1 || [];
            const category2 = shop.category2 || [];
            if (newItem.category1 && !category1.includes(newItem.category1)) {
              category1.push(newItem.category1);
            }
            if (newItem.category2 && !category2.includes(newItem.category2)) {
              category2.push(newItem.category2);
            }
            const newData = await db
              .collection(`restaurants/${shop.id}/menus`)
              .add(newItem);

            const menuLists = shop.menuLists || [];
            menuLists.push(newData.id);

            await db.doc(`restaurants/${shop.id}`).update({
              menuLists,
              category1,
              category2,
            });
          },
        });
      }
    };
    const submitItem = async () => {
      submitting.value = true;
      //upload image
      try {
        if (files["menu"]) {
          const path = `/images/restaurants/${menuRestaurantId.value}/menus/${menuId}/${uid.value}/item.jpg`;
          const photo = await uploadFile(files["menu"], path);
          menuInfo.itemPhoto = photo;
          menuInfo.images.item = {
            original: photo,
            resizedImages: {},
          };
        }
        const itemData = newItemData();

        // Convert double-width characters with half-width characters in options
        // We also convert Japanse commas with alphabet commas
        itemData.itemOptionCheckbox = itemData.itemOptionCheckbox.map(
          (option) => {
            return halfCharactors(option.replace(/、/g, (s) => ","));
          }
        );

        const newData = await db
          .doc(`restaurants/${menuRestaurantId.value}/menus/${menuId}`)
          .update(itemData);

        router.push({
          path: `/admin/restaurants/${restaurantId}/menus`,
        });
      } catch (error) {
        submitting.value = false;
        store.commit("setErrorMessage", {
          code: "menu.save",
          error,
        });
        console.log(error);
      }
    };

    return {
      dummyCheckbox: [],
      menuInfo,

      taxRates,
      taxRateKeys,
      requireTaxPriceDisplay,
      currencyKey,
      maxPrice,
      notFound,
      menuId,
      submitting,
      categoryKey,
      restaurants,
      copyRestaurantId,

      allergens,
      priceStep,

      // computed
      itemOptions,
      categories1,
      categories2,
      itemPhoto,

      errors,
      hasError,

      displayOptionPrice,
      handleCategoryUpdated,
      handleDismissed,
      editCategory,
      handleMenuImage,
      deleteOption,
      addOption,
      copyItem,
      submitItem,

      daysOfWeek,

      smallImageErrorHandler,
    };
  },
});
</script>
