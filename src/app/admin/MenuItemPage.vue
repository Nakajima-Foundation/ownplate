<template>
  <div>
    <template v-if="notFound == null"></template>
    <template v-else-if="notFound">
      <not-found />
    </template>
    <template v-else>
      <!-- Header -->
      <div class="mt-6 mx-6 lg:flex lg:items-center">
        <div class="flex-1"></div>

        <!-- Notifications -->
        <div class="mt-4 lg:mt-0 flex-shrink-0 text-right">
          <notification-index :shopInfo="restaurantInfo" />
        </div>
      </div>

      <!-- Save and Cancel -->
      <div class="flex justify-center space-x-4 mt-6">
        <!-- Cancel Button -->
        <b-button
          class="b-reset-tw"
          tag="nuxt-link"
          :to="`/admin/restaurants/${this.restaurantId()}/menus`"
        >
          <div
            class="h-12 rounded-full bg-black bg-opacity-5 inline-flex items-center px-6"
          >
            <span class="text-black text-opacity-60 text-base font-bold">{{
              $t("button.cancel")
            }}</span>
          </div>
        </b-button>

        <!-- Save Button -->
        <b-button @click="submitItem" :disabled="submitting" class="b-reset-tw">
          <div
            class="h-12 rounded-full bg-op-teal inline-flex justify-center items-center px-6 shadow"
            style="min-width:8rem;"
          >
            <span class="text-white text-base font-bold">{{
              $t(
                submitting
                  ? "editCommon.saving"
                  : menuInfo.publicFlag
                  ? "editCommon.save"
                  : "editCommon.saveDraft"
              )
            }}</span>
          </div>
        </b-button>
      </div>

      <!-- Publish Status -->
      <div class="bg-black bg-opacity-5 mx-6 rounded-lg p-4 mt-6 text-center">
        <b-checkbox
          v-model="menuInfo.publicFlag"
          :disabled="hasError"
          :type="!menuInfo.publicFlag ? 'is-danger' : ''"
        >
          <div class="font-bold">{{ $t("shopInfo.public") }}</div>
        </b-checkbox>

        <div class="text-sm font-bold">
          <div v-if="hasError" class="text-red-700 mt-1">
            {{ $t("editRestaurant.draftWarning") }}
          </div>
          <div
            class="text-red-700 mt-1"
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
      <div class="mt-6 mx-6 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
        <!-- Left -->
        <div>
          <!-- Item Name -->
          <div>
            <div class="text-sm font-bold pb-2">
              {{ $t("editMenu.itemName") }}
              <span class="text-red-700">*</span>
            </div>
            <b-field
              :type="errors['itemName'].length > 0 ? 'is-danger' : 'is-success'"
            >
              <b-input
                v-model="menuInfo.itemName"
                :placeholder="$t('editMenu.enterItemName')"
              ></b-input>
            </b-field>
          </div>

          <!-- Item Name -->
          <div class="mt-6">
            <div class="text-sm font-bold pb-2">
              {{ $t("editMenu.itemAliasesName") }}
            </div>
              <b-input
                v-model="menuInfo.itemAliasesName"
                :placeholder="$t('editMenu.enterItemAliasesName')"
              ></b-input>
          </div>

          <!-- Item Price -->
          <div class="mt-6">
            <div class="text-sm font-bold pb-2">
              {{ $t("editMenu.price") }}
              <span class="text-red-700">*</span>
            </div>
            <div>
              <b-field
                :type="errors['price'].length > 0 ? 'is-danger' : 'is-success'"
              >
                <b-input
                  v-model="menuInfo.price"
                  type="number"
                  :step="priceStep"
                  placeholder="00.00"
                  :max="maxPrice"
                  min="0.00"
                  expanded
                ></b-input>
                <div>
                  <span class="button is-static">
                    {{ $t("currency." + this.currencyKey) }}
                  </span>
                </div>
              </b-field>
            </div>
          </div>

          <!-- Item Tax -->
          <div class="mt-6">
            <div class="text-sm font-bold pb-2">
              {{ $t("editMenu.tax") }}
              <span class="text-red-700">*</span>
            </div>
            <div>
              <b-field
                :type="errors['tax'].length > 0 ? 'is-danger' : 'is-success'"
              >
                <b-select v-model="menuInfo.tax" placeholder="select">
                  <option
                    v-for="taxItem in taxRates"
                    :value="taxItem"
                    :key="taxItem"
                  >
                    {{
                      restaurantInfo &&
                        (restaurantInfo[taxItem + "Tax"] || 0) + "%"
                    }}
                    - {{ $t("editMenu." + taxRateKeys[taxItem]) }}
                  </option>
                </b-select>
              </b-field>
            </div>
          </div>

          <!-- Price Example -->
          <div
            v-if="requireTaxPriceDisplay"
            class="mt-6 bg-black bg-opacity-5 rounded-lg p-4"
          >
            <div class="inline text-sm font-bold">
              {{ $t("editMenu.displayPrice") }}:
            </div>
            <div class="inline">
              <Price :shopInfo="restaurantInfo" :menu="menuInfo" />
            </div>
          </div>

          <!-- Allergens -->
          <div class="mt-6">
            <div class="text-sm font-bold pb-2">
              {{ $t("allergens.title") }}
            </div>
            <div>
              <b-checkbox
                v-for="allergen in allergens"
                v-model="menuInfo.allergens[allergen]"
                :key="allergen"
                class="mb-2"
                >{{ $t(`allergens.${allergen}`) }}</b-checkbox
              >
            </div>
          </div>

          <!-- Item Description -->
          <div class="mt-6">
            <div class="text-sm font-bold pb-2">
              {{ $t("editMenu.itemDescription") }}
            </div>
            <div>
              <b-field
                :type="
                  errors['itemDescription'].length > 0
                    ? 'is-danger'
                    : 'is-success'
                "
              >
                <b-input
                  v-model="menuInfo.itemDescription"
                  type="textarea"
                  :placeholder="$t('editMenu.enterItemDescription')"
                ></b-input>
              </b-field>
            </div>
          </div>

          <!-- Item Memo -->
          <div class="mt-6">
            <div class="text-sm font-bold pb-2">
              {{ $t("editMenu.itemMemo") }}
            </div>
            <div>
              <b-field type="is-success">
                <b-input
                  v-model="menuInfo.itemMemo"
                  type="textarea"
                  :placeholder="$t('editMenu.enterItemMemo')"
                ></b-input>
              </b-field>
            </div>
          </div>
        </div>

        <!-- Right -->
        <div class="mt-6 lg:mt-0">
          <!-- Item Photo -->
          <div>
            <div class="text-sm font-bold pb-2">
              {{ $t("editMenu.itemPhoto") }}
            </div>
            <div class="flex">
              <!-- Current Photo -->
              <div v-if="itemPhoto" class="mr-4">
                <div>
                  <img
                    class="rounded object-cover"
                    :src="itemPhoto"
                    style="width: 128px; height: 128px;"
                  />
                </div>
                <div class="text-center text-xs mt-1">
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
                <div class="text-center text-xs mt-1 w-32">
                  {{ $t("editCommon.new") }}
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="text-sm text-black text-opacity-60 pt-2">
              {{ $t("editCommon.clickAndUploadDetail") }}
            </div>
          </div>

          <!-- Item Options -->
          <div class="mt-6">
            <div class="text-sm font-bold pb-2">
              {{ $t("editMenu.itemOptions") }}
            </div>

            <div class="text-sm pb-2">
              {{ $t("editMenu.itemOptionsNote") }}
            </div>

            <!-- Option Settings -->
            <div class="grid-col-1 space-y-4">
              <div v-for="(option, key) in menuInfo.itemOptionCheckbox">
                <div :key="key" class="flex mb-2">
                  <b-input
                    v-model="menuInfo.itemOptionCheckbox[key]"
                    :placeholder="$t('editMenu.enterItemOption')"
                    class="flex-1 mr-2"
                  />
                  <b-button class="b-reset-tw" @click="deleteOption(key)">
                    <div
                      class="inline-flex justify-center items-center rounded-full h-9 px-4 bg-red-700 bg-opacity-10"
                    >
                      <i class="material-icons text-lg text-red-700">delete</i>
                    </div>
                  </b-button>
                </div>

                <!-- Option Preview -->
                <div class="bg-black bg-opacity-5 rounded-lg p-4">
                  <div
                    class="flex mb-2 text-xs font-bold text-black text-opacity-30"
                  >
                    <div class="flex-1">
                      {{ $t("editMenu.optionsPreview") }}
                    </div>
                    <div>{{ $t("editMenu.priceChange") }}</div>
                  </div>

                  <div v-for="(opt, k) in itemOptions[key]" class="flex">
                    <div class="flex-1">
                      <b-checkbox v-if="itemOptions[key].length == 1" disabled>
                        <div
                          class="text-sm font-bold text-black text-opacity-60"
                        >
                          {{ displayOption(opt, restaurantInfo, menuInfo) }}
                        </div>
                      </b-checkbox>
                      <b-radio
                        v-else
                        v-model="dummyCheckbox[key]"
                        :native-value="k"
                        disabled
                      >
                        <div
                          class="text-sm font-bold text-black text-opacity-60"
                        >
                          {{ displayOption(opt, restaurantInfo, menuInfo) }}
                        </div>
                      </b-radio>
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
              <b-button class="b-reset-tw" @click="addOption">
                <div
                  class="inline-flex justify-center items-center rounded-full h-9 px-4 bg-black bg-opacity-5"
                >
                  <i class="material-icons text-lg text-op-teal mr-2">add</i>
                  <div class="text-sm font-bold text-op-teal">
                    {{ $t("editMenu.itemAddOption") }}
                  </div>
                </div>
              </b-button>
            </div>
          </div>

          <!-- CSV Categories -->
          <div class="mt-6">
            <div class="text-sm font-bold pb-2">
              {{ $t("editMenu.csvCategories") }}
            </div>

            <div class="text-sm pb-2">
              {{ $t("editMenu.csvCategoriesNote") }}
            </div>

            <div
              class="bg-black bg-opacity-5 rounded-lg p-4 grid-cols-1 space-y-4"
            >
              <!-- Category 1 -->
              <div>
                <div class="flex items-center mb-2">
                  <div
                    class="flex-1 text-sm font-bold text-black text-opacity-60"
                  >
                    {{ $t("editMenu.category1") }}
                  </div>
                  <div>
                    <b-button
                      class="b-reset-tw"
                      @click="editCategory('category1')"
                    >
                      <div class="inline-flex justify-center items-center">
                        <div class="text-sm font-bold text-op-teal">
                          {{ $t("editMenu.editCategory1") }}
                        </div>
                      </div>
                    </b-button>
                  </div>
                </div>

                <b-select
                  v-if="categories1.length > 0"
                  v-model="menuInfo.category1"
                  expanded
                >
                  <option
                    v-for="category in categories1"
                    :key="category"
                    :value="category"
                    >{{ category }}</option
                  >
                </b-select>
              </div>

              <!-- Category 2 -->
              <div>
                <div class="flex items-center mb-2">
                  <div
                    class="flex-1 text-sm font-bold text-black text-opacity-60"
                  >
                    {{ $t("editMenu.category2") }}
                  </div>
                  <div>
                    <b-button
                      class="b-reset-tw"
                      @click="editCategory('category2')"
                    >
                      <div class="inline-flex justify-center items-center">
                        <div class="text-sm font-bold text-op-teal">
                          {{ $t("editMenu.editCategory2") }}
                        </div>
                      </div>
                    </b-button>
                  </div>
                </div>

                <b-select
                  v-if="categories2.length > 0"
                  v-model="menuInfo.category2"
                  expanded
                >
                  <option
                    v-for="category in categories2"
                    :key="category"
                    :value="category"
                    >{{ category }}</option
                  >
                </b-select>
              </div>

              <!-- Category Edit Popup -->
              <edit-category
                v-if="categoryKey"
                :categoryKey="categoryKey"
                :restaurantInfo="restaurantInfo"
                @dismissed="handleDismissed"
                @updated="handleCategoryUpdated"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Publish Status -->
      <div class="bg-black bg-opacity-5 mx-6 rounded-lg p-4 mt-6 text-center">
        <b-checkbox
          v-model="menuInfo.publicFlag"
          :disabled="hasError"
          :type="!menuInfo.publicFlag ? 'is-danger' : ''"
        >
          <div class="font-bold">{{ $t("shopInfo.public") }}</div>
        </b-checkbox>

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
      <div class="flex justify-center space-x-4 mt-6">
        <!-- Cancel Button -->
        <b-button
          class="b-reset-tw"
          tag="nuxt-link"
          :to="`/admin/restaurants/${this.restaurantId()}/menus`"
        >
          <div
            class="h-12 rounded-full bg-black bg-opacity-5 inline-flex items-center px-6"
          >
            <span class="text-black text-opacity-60 text-base font-bold">{{
              $t("button.cancel")
            }}</span>
          </div>
        </b-button>

        <!-- Save Button -->
        <b-button @click="submitItem" :disabled="submitting" class="b-reset-tw">
          <div
            class="h-12 rounded-full bg-op-teal inline-flex justify-center items-center px-6 shadow"
            style="min-width:8rem;"
          >
            <span class="text-white text-base font-bold">{{
              $t(
                submitting
                  ? "editCommon.saving"
                  : menuInfo.publicFlag
                  ? "editCommon.save"
                  : "editCommon.saveDraft"
              )
            }}</span>
          </div>
        </b-button>
      </div>

      <!-- Copy -->
      <div class="text-center mt-6 mx-6 lg:max-w-sm lg:mx-auto">
        <div>
          <b-button @click="copyItem" :disabled="submitting" class="b-reset-tw">
            <div
              class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons text-lg text-op-teal mr-2">
                queue
              </i>
              <span class="text-sm font-bold text-op-teal">{{
                $t("editCommon.copyMenu")
              }}</span>
            </div>
          </b-button>
        </div>

        <div class="mt-4">
          <b-select v-model="copyRestaurantId" expanded>
            <option
              v-for="restaurant in restaurants"
              :key="restaurant.id"
              :value="restaurant.id"
              >{{ restaurant.restaurantName }}</option
            >
          </b-select>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import Vue from "vue";
import { db, storage } from "~/plugins/firebase.js";
import firebase from "firebase/app";
import NotFound from "~/components/NotFound";
import BackButton from "~/components/BackButton";
import Price from "~/components/Price";
import { taxRates } from "~/plugins/constant.js";
import NotificationIndex from "./Notifications/Index";
import { ownPlateConfig } from "@/config/project";
import {
  halfCharactors,
  formatOption,
  optionPrice
} from "~/plugins/strings.js";
import EditCategory from "~/app/admin/Menus/EditCategory";

export default {
  name: "Order",
  head() {
    return {
      title: this.menuInfo.itemName ?
        ["Admin Menu Item", this.menuInfo.itemName, this.restaurantInfo.restaurantName , this.defaultTitle].join(" / ") : this.defaultTitle
    }
  },

  components: {
    Price,
    BackButton,
    NotificationIndex,
    NotFound,
    EditCategory
  },

  data() {
    return {
      dummyCheckbox: [],
      menuInfo: {
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
        category1: "",
        category2: ""
      },

      taxRates: taxRates,
      taxRateKeys: [],
      requireTaxPriceDisplay: false,
      currencyKey: "US",
      maxPrice: 1000000.0 / this.$store.getters.stripeRegion.multiple,
      restaurantInfo: {},
      notFound: null,
      menuId: this.$route.params.menuId,
      submitting: false,
      files: {},
      categoryKey: null,
      restaurants: [],
      copyRestaurantId: null
    };
  },
  async created() {
    this.taxRateKeys = this.regionalSetting["taxRateKeys"];
    this.requireTaxPriceDisplay = this.regionalSetting.requireTaxPriceDisplay;
    this.currencyKey = this.regionalSetting["CurrencyKey"];

    this.checkAdminPermission();

    const restaurantRef = db.doc(`restaurants/${this.restaurantId()}`);
    const resRestInfo = await restaurantRef.get();
    if (!resRestInfo.exists) {
      this.notFound = true;
      console.log("no restaurant");
      return;
    }
    this.restaurantInfo = resRestInfo.data();
    if (!this.restaurantInfo.category1) {
      this.restaurantInfo.category1 = [];
    }
    if (!this.restaurantInfo.category2) {
      this.restaurantInfo.category2 = [];
    }

    if (this.restaurantInfo.uid !== this.uid) {
      this.notFound = true;
      console.log("no owner");
      return;
    }
    const menuRes = db.doc(
      `restaurants/${this.restaurantId()}/menus/${this.menuId}`
    );
    const resMenuInfo = await menuRes.get();
    if (!resMenuInfo.exists) {
      this.notFound = true;
      console.log("no menu");
      return;
    }
    this.menuInfo = Object.assign({}, this.menuInfo, resMenuInfo.data());
    this.notFound = false;

    const restaurantsCollection = await db
      .collection("restaurants")
      .where("uid", "==", this.uid)
      .where("deletedFlag", "==", false)
      .get();
    if (!restaurantsCollection.empty && restaurantsCollection.docs.length > 0) {
      this.restaurants = restaurantsCollection.docs.map(r =>
        this.doc2data("r")(r)
      );
    }
  },
  computed: {
    itemOptions() {
      return this.menuInfo.itemOptionCheckbox.map(v => {
        return v.split(",");
      });
    },
    categories1() {
      return this.restaurantInfo.category1;
    },
    categories2() {
      return this.restaurantInfo.category2;
    },
    itemPhoto() {
      return (
        (this.menuInfo?.images?.item?.resizedImages || {})["600"] ||
        this.menuInfo.itemPhoto
      );
    },
    allergens() {
      return this.$store.getters.stripeRegion.allergens;
    },
    priceStep() {
      return 10.0 / this.$store.getters.stripeRegion.multiple;
    },
    errors() {
      const err = {};
      ["itemName", "price", "tax"].forEach(name => {
        err[name] = [];
        if (this.menuInfo[name] === "") {
          err[name].push("validationError." + name + ".empty");
        }
      });
      err["itemDescription"] = [];
      return err;
    },
    uid() {
      return this.$store.getters.uidAdmin;
    },
    hasError() {
      const num = this.countObj(this.errors);
      return num > 0;
    }
  },
  /*
  watch: {
    hasError: function() {
      this.menuInfo.publicFlag = !this.hasError;
    }
  },
  */
  methods: {
    displayOptionPrice(str) {
      const price = this.roundPrice(optionPrice(str) * this.taxRate(this.restaurantInfo, this.menuInfo));
      if (price === 0) {
        return this.$t("editMenu.noPriceChange");
      } else if (price > 0) {
        return "+" + this.$n(price, "currency");
      }
      return this.$n(price, "currency");
    },
    async handleCategoryUpdated(categories) {
      await db.doc(`restaurants/${this.restaurantId()}`).update({
        [this.categoryKey]: categories
      });
      this.restaurantInfo[this.categoryKey] = categories;
    },
    handleDismissed() {
      this.categoryKey = null;
    },
    editCategory(key) {
      this.categoryKey = key;
    },
    handleMenuImage(e) {
      this.files["menu"] = e;
    },
    deleteOption(pos) {
      this.menuInfo.itemOptionCheckbox.splice(pos, 1);
      // console.log(e);
    },
    addOption() {
      this.menuInfo.itemOptionCheckbox.push("");
    },
    async copyItem() {
      if (this.copyRestaurantId !== null) {
        const shop = this.restaurants.find(r => r.id === this.copyRestaurantId);
        this.$store.commit("setAlert", {
          title: shop.restaurantName,
          code: "editCommon.copyMenuAlert",
          callback: async () => {
            const newItem = this.getNewItemData();
            newItem.publicFlag = false;
            newItem.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            newItem.deletedFlag = false;
            newItem.uid = this.$store.getters.uidAdmin;

            const newData = await db
              .collection(`restaurants/${shop.id}/menus`)
              .add(newItem);

            const menuLists = shop.menuLists;
            menuLists.push(newData.id);

            await db
              .doc(`restaurants/${shop.id}`)
              .update("menuLists", menuLists);
          }
        });
      }
    },
    getNewItemData() {
      const itemData = {
        itemName: this.menuInfo.itemName,
        itemAliasesName: this.menuInfo.itemAliasesName || "",
        price:
          ownPlateConfig.region === "JP"
            ? Math.round(Number(this.menuInfo.price))
            : Number(this.menuInfo.price),
        tax: this.menuInfo.tax,
        itemDescription: this.menuInfo.itemDescription,
        itemMemo: this.menuInfo.itemMemo,
        itemPhoto: this.menuInfo.itemPhoto,
        images: {
          item: this.menuInfo.images.item || {}
        },
        itemOptionCheckbox: this.menuInfo.itemOptionCheckbox || [],
        publicFlag: this.menuInfo.publicFlag || false,
        allergens: this.menuInfo.allergens,
        validatedFlag: !this.hasError,
        category1: this.menuInfo.category1,
        category2: this.menuInfo.category2
      };
      return itemData;
    },
    async submitItem() {
      this.submitting = true;
      //upload image
      try {
        if (this.files["menu"]) {
          const path = `/images/restaurants/${this.restaurantId()}/menus/${
            this.menuId
          }/${this.uid}/item.jpg`;
          this.menuInfo.itemPhoto = await this.uploadFile(
            this.files["menu"],
            path
          );
          this.menuInfo.images.item = {
            original: this.menuInfo.itemPhoto,
            resizedImages: {}
          };
        }
        const itemData = this.getNewItemData();

        // Convert double-width characters with half-width characters in options
        // We also convert Japanse commas with alphabet commas
        itemData.itemOptionCheckbox = itemData.itemOptionCheckbox.map(
          option => {
            return halfCharactors(option.replace(/、/g, s => ","));
          }
        );

        const newData = await db
          .doc(`restaurants/${this.restaurantId()}/menus/${this.menuId}`)
          .update(itemData);

        this.$router.push({
          path: `/admin/restaurants/${this.restaurantId()}/menus`
        });
      } catch (error) {
        this.submitting = false;
        this.$store.commit("setErrorMessage", {
          code: "menu.save",
          error
        });
        console.log(error);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
// .croppa-container {
//   cursor: pointer;
// }
// .croppa-container canvas {
//   border-radius: 4px !important;
//   background: #f00 !important;
// }
</style>
