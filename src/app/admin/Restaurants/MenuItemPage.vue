<template>
  <div>
    <template v-if="notFound == null"></template>
    <template v-else-if="notFound">
      <not-found />
    </template>
    <template v-else>
      <!-- Header -->
      <div class="mx-6 mt-4 lg:flex lg:items-center">
        <div class="flex-1"></div>

        <!-- Notifications -->
        <div class="mt-4 shrink-0 text-right lg:mt-0">
          <notification-index :shopInfo="shopInfo" />
        </div>
      </div>

      <!-- Save and Cancel -->
      <div class="mt-2 flex justify-center space-x-4">
        <!-- Cancel Button -->
        <router-link
          class="cursor-pointer"
          :to="`/admin/restaurants/${restaurantId}/menus`"
        >
          <div
            class="inline-flex h-12 items-center rounded-full bg-black/5 px-6"
          >
            <span class="text-base font-bold text-black/60">{{
              $t("button.cancel")
            }}</span>
          </div>
        </router-link>

        <!-- Save Button -->
        <t-button
          @click="submitItem"
          :isDisabled="submitting"
          class="h-12 px-8 font-bold text-white"
        >
          {{
            $t(
              submitting
                ? "editCommon.saving"
                : menuInfo.publicFlag
                  ? "editCommon.save"
                  : "editCommon.saveDraft",
            )
          }}
        </t-button>
      </div>

      <!-- Publish Status -->
      <div class="mx-6 mt-4 rounded-lg bg-black/5 p-4 text-center">
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
      <div class="mx-6 mt-2 text-sm font-bold text-red-700">
        * {{ $t("editRestaurant.required") }}
      </div>

      <!-- Settings -->
      <div class="mx-6 mt-4 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
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
          <div class="mt-4">
            <div class="pb-2 text-sm font-bold">
              {{ $t("editMenu.itemAliasesName") }}
            </div>
            <o-input
              v-model="menuInfo.itemAliasesName"
              :placeholder="$t('editMenu.enterItemAliasesName')"
            ></o-input>
          </div>

          <!-- Item Price -->
          <div class="mt-4 rounded-lg border border-black/10 bg-white p-2">
            <span class="font-bold">{{ $t("editMenu.priceSettings") }}</span>
            <div class="mt-4">
              <div class="pb-2 text-sm font-bold">
                {{ $t("editMenu.price") }}
                <span class="text-red-700">*</span>
              </div>
              <div>
                <o-field
                  :variant="errors['price'].length > 0 ? 'danger' : 'success'"
                  class="has-addons"
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
                  <span class="button is-static">
                    {{ $t("currency." + currencyKey) }}
                  </span>
                </o-field>
              </div>
            </div>

            <!-- Item Tax -->
            <div class="mt-4">
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
              class="mt-2 rounded-lg bg-black/5 p-4"
            >
              <div class="inline text-sm font-bold">
                {{ $t("editMenu.displayPrice") }}:
              </div>
              <div class="inline">
                <Price :shopInfo="shopInfo" :menu="menuInfo" />
              </div>
            </div>
          </div>

          <!-- Allergens -->
          <div class="mt-4">
            <div class="pb-2 text-sm font-bold">
              {{ $t("allergens.title") }}
            </div>
            <div class="mt-2 rounded-lg bg-black/5 px-4 py-4">
              <div>
                <o-checkbox
                  v-for="allergen in allergens"
                  v-model="menuInfo.allergens[allergen]"
                  :key="allergen"
                  >{{ $t(`allergens.${allergen}`) }}</o-checkbox
                >
              </div>
            </div>
          </div>

          <!-- Item Description -->
          <div class="mt-4">
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
          <div class="mt-4">
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

          <div class="mt-4 rounded-sm border border-black/10 bg-white p-2">
            <span class="font-bold">{{
              $t("editMenu.availableDayTimeSettings")
            }}</span>
            <!-- Lunch  or Dinner -->
            <div
              class="mt-4 cursor-pointer text-sm font-bold"
              @click="openTips('lunchDinner')"
            >
              {{ $t("editMenu.lunchDinner") }}
              <i class="material-icons">
                <span class="text-sm">help</span>
              </i>
              <span class="text-red-700">*</span>
            </div>
            <div class="mt-2">
              <div class="rounded-lg bg-black/5 p-4">
                <div>
                  <o-checkbox class="mr-2" v-model="menuInfo.availableLunch">
                    <span class="text-sm font-bold text-black/60">
                      {{ $t("shopInfo.lunch") }}
                    </span>
                  </o-checkbox>
                </div>
                <div class="mt-2">
                  <o-checkbox class="mr-2" v-model="menuInfo.availableDinner">
                    <span class="text-sm font-bold text-black/60">
                      {{ $t("shopInfo.dinner") }}
                    </span>
                  </o-checkbox>
                </div>
              </div>
            </div>
            <!-- end of Lunch Dinner -->

            <!-- exclusionDate/Time -->
            <div
              class="mt-4 cursor-pointer text-sm font-bold"
              @click="openTips('exclusionDateTime')"
            >
              {{ $t("editMenu.exclusionDateTime") }}
              <i class="material-icons">
                <span class="text-sm">help</span>
              </i>
              <span class="text-red-700">*</span>
            </div>
            <div class="mt-2">
              <div class="rounded-lg bg-black/5 p-4">
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
            </div>
            <!-- end of exclusionDate/Time -->
          </div>
        </div>

        <!-- Right -->
        <div class="mt-4 lg:mt-0">
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
                    class="rounded-sm object-cover"
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
                <ImageUpload
                  @handler="handleMenuImage"
                  :preview="previewMenu"
                  style="width: 128px; height: 128px"
                />
                <div class="mt-1 w-32 text-center text-xs">
                  {{ $t("editCommon.new") }}
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="pt-2 text-sm text-black/60">
              {{ $t("editCommon.clickAndUploadDetail") }}
            </div>
          </div>

          <!-- Additional Photos -->
          <div v-if="false" class="mt-4">
            <div class="pb-2 text-sm font-bold">
              {{ $t("editMenu.additionalPhotos") }}
            </div>

            <div class="flex">
              <!-- ToDo 写真が追加されると追加された分だけ(最大4枚)サムネイルを表示-->
              <div class="relative mr-2">
                <img
                  class="h-24 w-24 rounded-sm"
                  :src="itemPhoto"
                  @error="smallImageErrorHandler"
                />
                <!-- ToDo 写真右上の ×アイコンを押すと写真を削除-->
                <span
                  class="material-icons absolute top-1 right-1 rounded-full bg-black/40 text-white"
                >
                  close
                </span>
              </div>
            </div>

            <div class="mt-4 flex">
              <!-- ToDo 以下のボタンを押すと写真選択のウィンドウが立ち上がり、複数選択&アップロードできる -->
              <button class="mr-2 cursor-pointer">
                <!-- ToDo 写真が4枚アップロード済みの時はボタンをグレーアウト、"text-op-teal" → "text-black/20" を適用 -->
                <div
                  class="text-op-teal inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
                >
                  <i class="material-icons mr-2 text-lg">add</i>
                  <div class="text-sm font-bold">
                    {{ $t("editMenu.addPhotos") }}
                  </div>
                </div>
              </button>
              <!-- ToDo 写真が1枚でもアップロードされたら以下の削除ボタンを表示させる-->
              <button class="cursor-pointer">
                <div
                  class="inline-flex h-9 items-center justify-center rounded-full bg-red-700/10 px-4 text-red-700"
                >
                  <i class="material-icons mr-2 text-lg">delete</i>
                  <div class="text-sm font-bold">
                    {{ $t("editMenu.deleteAllPhotos") }}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Item Options -->
          <div class="mt-4">
            <div class="pb-2 text-sm font-bold">
              {{ $t("editMenu.itemOptions") }}
            </div>

            <div class="pb-2 text-sm">
              {{ $t("editMenu.itemOptionsNote") }}
            </div>

            <!-- Option Settings -->
            <div class="grid-col-1 space-y-4">
              <div
                v-for="(option, key) in menuInfo.itemOptionCheckbox"
                :key="key"
              >
                <div :key="key" class="mb-2 flex">
                  <button @click="positionDown(key)" class="cursor-pointer">
                    <div
                      class="mr-2 inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
                      v-if="key !== menuInfo.itemOptionCheckbox.length - 1"
                    >
                      <i class="material-icons text-op-teal text-lg"
                        >arrow_downward</i
                      >
                    </div>
                  </button>
                  <button @click="positionUp(key)" class="cursor-pointer">
                    <div
                      class="mr-2 inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
                      v-if="key !== 0"
                    >
                      <i class="material-icons text-op-teal text-lg"
                        >arrow_upward</i
                      >
                    </div>
                  </button>
                  <div class="mr-2 flex-1">
                    <o-input
                      v-model="menuInfo.itemOptionCheckbox[key]"
                      :placeholder="$t('editMenu.enterItemOption')"
                    />
                  </div>
                  <button class="cursor-pointer" @click="deleteOption(key)">
                    <div
                      class="inline-flex h-9 items-center justify-center rounded-full bg-red-700/10 px-4"
                    >
                      <i class="material-icons text-lg text-red-700">delete</i>
                    </div>
                  </button>
                </div>

                <!-- Option Preview -->
                <div class="rounded-lg bg-black/5 p-4">
                  <div class="mb-2 flex text-xs font-bold text-black/30">
                    <div class="flex-1">
                      {{ $t("editMenu.optionsPreview") }}
                    </div>
                    <div>{{ $t("editMenu.priceChange") }}</div>
                  </div>

                  <div
                    v-for="(opt, k) in itemOptions[key]"
                    class="flex"
                    :key="k"
                  >
                    <div class="flex-1">
                      <o-checkbox
                        class="mr-2"
                        v-if="itemOptions[key].length == 1"
                        disabled
                      >
                        <span class="text-sm font-bold text-black/60">
                          {{ displayOption(opt, shopInfo, menuInfo) }}
                        </span>
                      </o-checkbox>
                      <template v-else>
                        <input
                          type="radio"
                          class="mr-2"
                          v-model="dummyCheckbox[key]"
                          :value="k"
                          disabled
                        />
                        <span class="text-sm font-bold text-black/60">
                          {{ displayOption(opt, shopInfo, menuInfo) }}
                        </span>
                      </template>
                    </div>
                    <div class="text-sm font-bold text-black/60">
                      {{ displayOptionPrice(opt) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Add Option -->
            <div class="mt-4">
              <button class="cursor-pointer" @click="addOption">
                <div
                  class="inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
                >
                  <i class="material-icons text-op-teal mr-2 text-lg">add</i>
                  <div class="text-op-teal text-sm font-bold">
                    {{ $t("editMenu.itemAddOption") }}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- CSV Categories -->
          <div class="mt-4">
            <div class="pb-2 text-sm font-bold">
              {{ $t("editMenu.csvCategories") }}
            </div>

            <div class="pb-2 text-sm">
              {{ $t("editMenu.csvCategoriesNote") }}
            </div>

            <div class="grid-cols-1 space-y-4 rounded-lg bg-black/5 p-4">
              <!-- Category 1 -->
              <div>
                <div class="mb-2 flex items-center">
                  <div class="flex-1 text-sm font-bold text-black/60">
                    {{ $t("editMenu.category1") }}
                  </div>
                  <div>
                    <button
                      class="cursor-pointer"
                      @click="editCategory('category1')"
                    >
                      <div class="inline-flex items-center justify-center">
                        <div class="text-op-teal text-sm font-bold">
                          {{ $t("editMenu.editCategory1") }}
                        </div>
                      </div>
                    </button>
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
                  <div class="flex-1 text-sm font-bold text-black/60">
                    {{ $t("editMenu.category2") }}
                  </div>
                  <div>
                    <button
                      class="cursor-pointer"
                      @click="editCategory('category2')"
                    >
                      <div class="inline-flex items-center justify-center">
                        <div class="text-op-teal text-sm font-bold">
                          {{ $t("editMenu.editCategory2") }}
                        </div>
                      </div>
                    </button>
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
      <div class="mx-6 mt-4 rounded-lg bg-black/5 p-4 text-center">
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
      <div class="mt-4 flex justify-center space-x-4">
        <!-- Cancel Button -->
        <router-link
          class="cursor-pointer"
          :to="`/admin/restaurants/${restaurantId}/menus`"
        >
          <div
            class="inline-flex h-12 items-center rounded-full bg-black/5 px-6"
          >
            <span class="text-base font-bold text-black/60">{{
              $t("button.cancel")
            }}</span>
          </div>
        </router-link>

        <!-- Save Button -->
        <t-button
          @click="submitItem"
          :isDisabled="submitting"
          class="h-12 px-8 font-bold text-white"
        >
          {{
            $t(
              submitting
                ? "editCommon.saving"
                : menuInfo.publicFlag
                  ? "editCommon.save"
                  : "editCommon.saveDraft",
            )
          }}
        </t-button>
      </div>

      <!-- Copy -->
      <div class="mx-6 mt-4 text-center lg:mx-auto lg:max-w-sm">
        <div>
          <button
            @click="copyItem"
            :disabled="submitting"
            class="cursor-pointer"
          >
            <div
              class="inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
            >
              <i class="material-icons text-op-teal mr-2 text-lg"> queue </i>
              <span class="text-op-teal text-sm font-bold">{{
                $t("editCommon.copyMenu")
              }}</span>
            </div>
          </button>
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

<script lang="ts">
import { defineComponent, ref, computed, reactive, PropType } from "vue";
import { db } from "@/lib/firebase/firebase9";
import {
  doc,
  collection,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import NotFound from "@/components/NotFound.vue";
import Price from "@/components/Price.vue";
import EditCategory from "@/app/admin/Restaurants/MenuItemPage/EditCategory.vue";
import NotificationIndex from "@/app/admin/Notifications/Index.vue";
import HoursInput from "@/app/admin/inputComponents/HoursInput.vue";

import ImageUpload from "@/components/ImageUpload.vue";

import { taxRates, daysOfWeek } from "@/config/constant";
import { ownPlateConfig } from "@/config/project";
import { halfCharactors, optionPrice } from "@/utils/strings";
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
  displayOption,
  defaultTitle,
} from "@/utils/utils";

import { uploadFile } from "@/lib/firebase/storage";

import { getNewItemData, MenuData } from "@/models/menu";
import { checkShopOwner } from "@/utils/userPermission";

import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useHead } from "@unhead/vue";

import { RestaurantInfoData } from "@/models/RestaurantInfo";

export default defineComponent({
  name: "MenuItemPage",
  components: {
    Price,
    EditCategory,
    NotificationIndex,
    NotFound,
    HoursInput,
    ImageUpload,
  },
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
  },

  setup(props) {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const { t, n } = useI18n({ useScope: "global" });

    const dummyCheckbox = ref([]);

    const menuInfo = reactive<MenuData>({
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
    } as MenuData);

    useHead(() => ({
      title:
        menuInfo && menuInfo.itemName
          ? [
              "Admin Menu Item",
              menuInfo.itemName,
              props.shopInfo.restaurantName,
              defaultTitle,
            ].join(" / ")
          : defaultTitle,
    }));

    const maxPrice = 1000000.0 / stripeRegion.multiple;
    const allergens = stripeRegion.allergens;
    const priceStep = 1.0 / stripeRegion.multiple;

    const notFound = ref<boolean | null>(null);
    const menuId = route.params.menuId;
    const submitting = ref(false);

    const files: { [key: string]: File } = {};
    const categoryKey = ref<string | null>(null);
    const restaurants = ref<RestaurantInfoData[]>([]);
    const copyRestaurantId = ref<string | null>(null);

    const { uid } = useAdminUids();

    // allow sub Account
    if (!checkShopOwner(props.shopInfo, uid.value)) {
      return notFoundResponse;
    }
    const menuRestaurantId = computed(() => {
      return route.params.restaurantId;
    });

    const taxRateKeys = regionalSetting["taxRateKeys"];
    const requireTaxPriceDisplay = regionalSetting.requireTaxPriceDisplay;
    const currencyKey = regionalSetting["CurrencyKey"];

    const { restaurantId } = props.shopInfo;
    getDoc(
      doc(db, `restaurants/${menuRestaurantId.value}/menus/${menuId}`),
    ).then((menuInfoDoc) => {
      if (menuInfoDoc.exists()) {
        Object.assign(menuInfo, menuInfoDoc.data());
        notFound.value = false;
      } else {
        notFound.value = true;
      }
    });

    getDocs(
      query(
        collection(db, "restaurants"),
        where("uid", "==", uid.value),
        where("deletedFlag", "==", false),
      ),
    ).then((restaurantsCollection) => {
      if (
        !restaurantsCollection.empty &&
        restaurantsCollection.docs.length > 0
      ) {
        restaurants.value = restaurantsCollection.docs.map((r) =>
          doc2data("r")(r),
        ) as RestaurantInfoData[];
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
      const err: { [key: string]: string[] } = {};
      ["itemName", "price", "tax"].forEach((name: string) => {
        err[name] = [];
        if (menuInfo[name as keyof MenuData] === "") {
          err[name].push("validationError." + name + ".empty");
        }
      });
      err["itemDescription"] = [];
      return err;
    });
    const hasError = computed(() => {
      return countObj(errors.value) > 0;
    });

    const displayOptionPrice = (str: string) => {
      const price = roundPrice(
        optionPrice(str) * taxRate(props.shopInfo, menuInfo),
      );
      if (price === 0) {
        return t("editMenu.noPriceChange");
      } else if (price > 0) {
        return "+" + n(price, "currency");
      }
      return n(price, "currency");
    };
    const handleCategoryUpdated = async (categories: string) => {
      await updateDoc(doc(db, `restaurants/${menuRestaurantId.value}`), {
        [categoryKey.value || ""]: categories,
      });
    };
    const handleDismissed = () => {
      categoryKey.value = null;
    };
    const editCategory = (key: string) => {
      categoryKey.value = key;
    };
    const previewMenu = ref();
    const handleMenuImage = (file: File) => {
      previewMenu.value = URL.createObjectURL(file);
      files["menu"] = file;
    };
    const deleteOption = (pos: number) => {
      menuInfo.itemOptionCheckbox.splice(pos, 1);
      // console.log(e);
    };
    const addOption = () => {
      menuInfo.itemOptionCheckbox.push("");
    };
    const newItemData = () => {
      console.log(menuInfo);
      const itemData = getNewItemData(
        menuInfo,
        ownPlateConfig.region === "JP",
        !hasError.value,
      );
      return itemData;
    };
    const copyItem = () => {
      if (copyRestaurantId.value !== null) {
        const shop = restaurants.value.find(
          (r) => r.id === copyRestaurantId.value,
        );
        if (shop) {
          store.commit("setAlert", {
            title: shop.restaurantName,
            code: "editCommon.copyMenuAlert",
            callback: async () => {
              const newItem = newItemData();
              newItem.publicFlag = false;
              newItem.createdAt = serverTimestamp();
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
              const newData = await addDoc(
                collection(db, `restaurants/${shop.id}/menus`),
                newItem,
              );

              const menuLists = shop.menuLists || [];
              menuLists.push(newData.id);

              await updateDoc(doc(db, `restaurants/${shop.id}`), {
                menuLists,
                category1,
                category2,
              });
            },
          });
        }
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
            return halfCharactors(option.replace(/、/g, () => ","));
          },
        );

        await updateDoc(
          doc(db, `restaurants/${menuRestaurantId.value}/menus/${menuId}`),
          itemData as any,
        );

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

    const positionDown = (key: number) => {
      const item = [...menuInfo.itemOptionCheckbox];
      const tmp = item[key];
      item[key] = item[key + 1];
      item[key + 1] = tmp;
      menuInfo.itemOptionCheckbox = item;
    };
    const positionUp = (key: number) => {
      const item = [...menuInfo.itemOptionCheckbox];
      const tmp = item[key - 1];
      item[key - 1] = item[key];
      item[key] = tmp;
      menuInfo.itemOptionCheckbox = item;
    };

    const openTips = (key: string) => {
      store.commit("setTips", {
        key,
      });
    };
    return {
      dummyCheckbox,
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

      displayOption,
      displayOptionPrice,
      handleCategoryUpdated,
      handleDismissed,
      editCategory,
      previewMenu,
      handleMenuImage,
      deleteOption,
      addOption,
      copyItem,
      submitItem,

      daysOfWeek,

      smallImageErrorHandler,

      restaurantId,

      positionDown,
      positionUp,

      openTips,
    };
  },
});
</script>

<style scoped>
:deep(.field.has-addons) {
  display: flex;
  .control:first-child:not(:only-child) .input {
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
  }
  .control.has-icons-right {
    .icon.is-right {
      justify-content: center;
      pointer-events: none;
    }
    input[type="number"] {
      padding-right: 40px;
    }
  }
  .button {
    border-width: 1px;
    border-radius: 4px;
    justify-content: center;
    padding-bottom: calc(0.5em - 1px);
    padding-left: 1em;
    padding-right: 1em;
    padding-top: calc(0.5em - 1px);
    text-align: center;
    &.is-static {
      background-color: #f5f5f5;
      border-color: #dbdbdb;
      color: #7a7a7a;
      box-shadow: none;
      pointer-events: none;
    }
  }
}
</style>
