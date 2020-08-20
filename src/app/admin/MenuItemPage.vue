<template>
  <div>
    <template v-if="notFound == null"></template>
    <template v-else-if="notFound">
      <not-found />
    </template>
    <template v-else>
      <!-- Edit Header Area -->
      <div class="columns is-gapless">
        <!-- Left Gap -->
        <div class="column is-narrow w-24"></div>
        <!-- Center Column -->
        <div class="column">
          <div class="m-l-24 m-r-24">
            <!-- Nav Bar -->
            <div class="level">
              <!-- Back Button and Restaurant Profile -->
              <div class="level-left flex-1"></div>
              <!-- Notification Settings -->
              <div class="level-right">
                <notification-index :shopInfo="restaurantInfo" />
              </div>
            </div>

            <!-- Cancel and Save Button -->
            <div class="align-center m-t-24">
              <!-- Cancel Button -->
              <b-button
                class="b-reset op-button-small tertiary m-r-16"
                style="min-width: 128px;"
                tag="nuxt-link"
                :to="`/admin/restaurants/${this.restaurantId()}/menus`"
              >
                <span class="p-l-24 p-r-24">{{ $t("button.cancel") }}</span>
              </b-button>

              <!-- Save Button -->
              <b-button
                class="b-reset op-button-small primary"
                style="min-width: 128px;"
                :disabled="submitting"
                @click="submitItem"
              >
                <span class="c-onprimary p-l-24 p-r-24">
                  {{
                  $t(
                  submitting
                  ? "editCommon.saving"
                  : menuInfo.publicFlag
                  ? "editCommon.save"
                  : "editCommon.saveDraft"
                  )
                  }}
                </span>
              </b-button>
            </div>

            <!-- Public Checkbox -->
            <div class="m-t-24 align-center bg-form p-l-16 p-r-16 p-t-16 p-b-16 r-8">
              <b-checkbox
                v-model="menuInfo.publicFlag"
                :disabled="hasError"
                :type="!menuInfo.publicFlag ? 'is-danger' : ''"
              >
                <span class="t-subtitle1">{{ $t("shopInfo.public") }}</span>
              </b-checkbox>

              <!-- Messages -->
              <div>
                <div
                  v-if="hasError"
                  class="t-subtitle2 c-status-red"
                >{{ $t("editRestaurant.draftWarning") }}</div>
                <div
                  class="t-subtitle2 c-status-red"
                  v-if="!menuInfo.publicFlag && !hasError"
                >{{ $t("editMenu.saveAsDraft") }}</div>
              </div>
            </div>

            <!-- Required Note -->
            <div class="t-subtitle2 c-status-red m-t-24">* {{ $t("editMenu.required") }}</div>
          </div>
        </div>
        <!-- Right Gap -->
        <div class="column is-narrow w-24"></div>
      </div>

      <!-- Edit Body Area -->
      <div class="columns is-gapless">
        <!-- Left Gap -->
        <div class="column is-narrow w-24"></div>

        <!-- Left Column -->
        <div class="column">
          <div class="m-l-24 m-r-24">
            <!-- Item Name -->
            <div class="m-t-16">
              <div class="t-subtitle2 c-text-black-medium p-b-8">
                {{ $t("editMenu.itemName") }}
                <span class="c-status-red">*</span>
              </div>
              <b-field
                :type="
                  errors['itemName'].length > 0 ? 'is-danger' : 'is-success'
                "
              >
                <b-input v-model="menuInfo.itemName" :placeholder="$t('editMenu.enterItemName')"></b-input>
              </b-field>
            </div>

            <!-- Item Price -->
            <div class="m-t-16">
              <div class="t-subtitle2 c-text-black-medium p-b-8">
                {{ $t("editMenu.price") }}
                <span class="c-status-red">*</span>
              </div>
              <div>
                <b-field
                  :type="
                    errors['price'].length > 0 ? 'is-danger' : 'is-success'
                  "
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
                      {{
                      $t("currency." + this.currencyKey)
                      }}
                    </span>
                  </div>
                </b-field>
              </div>
            </div>

            <!-- Item Tax -->
            <div class="m-t-16">
              <div class="t-subtitle2 c-text-black-medium p-b-8">
                {{ $t("editMenu.tax") }}
                <span class="c-status-red">*</span>
              </div>
              <div>
                <b-field :type="errors['tax'].length > 0 ? 'is-danger' : 'is-success'">
                  <b-select v-model="menuInfo.tax" placeholder="select">
                    <option v-for="taxItem in taxRates" :value="taxItem" :key="taxItem">
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
            <div v-if="requireTaxPriceDisplay" class="m-t-16">
              <span class="t-subtitle2">{{ $t("editMenu.displayPrice") }}:</span>
              <span>
                <Price :shopInfo="restaurantInfo" :menu="menuInfo" />
              </span>
            </div>

            <!-- Allergens -->
            <div class="m-t-16">
              <div class="t-subtitle2 c-text-black-medium p-b-8">
                {{ $t("allergens.title") }}
                <span class="c-status-red"></span>
              </div>
              <div>
                <b-checkbox
                  v-for="allergen in allergens"
                  v-model="menuInfo.allergens[allergen]"
                  :key="allergen"
                  class="m-b-8"
                >{{ $t(`allergens.${allergen}`) }}</b-checkbox>
              </div>
            </div>

            <!-- Item Description -->
            <div class="m-t-16">
              <div class="t-subtitle2 c-text-black-medium p-b-8">
                {{ $t("editMenu.itemDescription") }}
                <span class="c-status-red"></span>
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
          </div>
        </div>

        <!-- Right Column -->
        <div class="column">
          <div class="m-l-24 m-r-24">
            <!-- Item Photo -->
            <div class="m-t-16">
              <div class="t-subtitle2 c-text-black-medium p-b-8">{{ $t("editMenu.itemPhoto") }}</div>
              <div class="cols">
                <!-- Current Photo -->
                <div v-if="itemPhoto" class="p-r-16">
                  <div>
                    <img class="w-128 h-128 r-4 cover" :src="itemPhoto" />
                  </div>
                  <div class="align-center t-caption">{{ $t("editCommon.current") }}</div>
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
                  <div class="align-center t-caption w-128">{{ $t("editCommon.new") }}</div>
                </div>
              </div>

              <!-- Description -->
              <div
                class="t-body2 c-text-black-medium p-l-8 p-r-8 m-t-8"
              >{{ $t("editCommon.clickAndUploadDetail") }}</div>
            </div>

            <!-- Item Options -->
            <div class="m-t-16">
              <div class="t-subtitle2 c-text-black-medium p-b-8">
                {{ $t("editMenu.itemOptions") }}
                <span class="c-status-red"></span>
              </div>
              <div>
                <div class="t-body2 c-text-black-medium p-b-8">{{ $t("editMenu.itemOptionsNote") }}</div>
                <!-- Option Details -->
                <div>
                  <template v-for="(option, key) in menuInfo.itemOptionCheckbox">
                    <div :key="key" class="cols m-b-8">
                      <b-input
                        v-model="menuInfo.itemOptionCheckbox[key]"
                        :placeholder="$t('editMenu.enterItemOption')"
                        class="flex-1"
                      />
                      <b-button
                        class="b-reset op-button-pill h-36 bg-status-red-bg m-l-8"
                        @click="deleteOption(key)"
                      >
                        <i class="material-icons c-status-red s-18 p-l-8 p-r-8">delete</i>
                      </b-button>
                    </div>
                  </template>
                </div>
                <!-- Add Option -->
                <div>
                  <b-button class="b-reset op-button-pill h-36 bg-form" @click="addOption">
                    <i class="material-icons c-primary m-l-8">add</i>
                    <span class="c-primary t-button">
                      {{
                      $t("editMenu.itemAddOption")
                      }}
                    </span>
                  </b-button>
                </div>
              </div>
            </div>

            <!-- Category 1 -->
            <div class="m-t-16">
              <div class="t-subtitle2 c-text-black-medium p-b-8">{{ $t("editMenu.category1") }}</div>
              <b-select v-if="categories1.length > 0" v-model="menuInfo.category1">
                <option
                  v-for="category in categories1"
                  :key="category"
                  :value="category"
                >{{ category }}</option>
              </b-select>
              <div class="m-t-8">
                <b-button
                  class="b-reset op-button-pill h-36 bg-form"
                  @click="editCategory('category1')"
                >
                  <span class="c-primary t-button">
                    {{
                    $t("editMenu.editCategory1")
                    }}
                  </span>
                </b-button>
              </div>
            </div>
            <!-- Category 2 -->
            <div class="m-t-16">
              <div class="t-subtitle2 c-text-black-medium p-b-8">{{ $t("editMenu.category2") }}</div>
              <b-select v-if="categories2.length > 0" v-model="menuInfo.category2">
                <option
                  v-for="category in categories2"
                  :key="category"
                  :value="category"
                >{{ category }}</option>
              </b-select>
              <div class="m-t-8">
                <b-button
                  class="b-reset op-button-pill h-36 bg-form"
                  @click="editCategory('category2')"
                >
                  <span class="c-primary t-button">
                    {{
                    $t("editMenu.editCategory2")
                    }}
                  </span>
                </b-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Gap -->
        <div class="column is-narrow w-24"></div>
      </div>

      <!-- Edit Footer Area -->
      <div class="columns is-gapless">
        <!-- Left Gap -->
        <div class="column is-narrow w-24"></div>
        <!-- Center Column -->
        <div class="column">
          <div class="m-l-24 m-r-24 m-t-24">
            <!-- Public Checkbox -->
            <div class="m-t-24 align-center bg-form p-l-16 p-r-16 p-t-16 p-b-16 r-8">
              <b-checkbox
                v-model="menuInfo.publicFlag"
                :disabled="hasError"
                :type="!menuInfo.publicFlag ? 'is-danger' : ''"
              >
                <span class="t-subtitle1">{{ $t("shopInfo.public") }}</span>
              </b-checkbox>

              <!-- Messages -->
              <div>
                <div
                  v-if="hasError"
                  class="t-subtitle2 c-status-red"
                >{{ $t("editRestaurant.draftWarning") }}</div>
                <div
                  class="t-subtitle2 c-status-red"
                  v-if="!menuInfo.publicFlag && !hasError"
                >{{ $t("editMenu.saveAsDraft") }}</div>
              </div>
            </div>

            <!-- Cancel and Save Button -->
            <div class="align-center m-t-24">
              <!-- Cancel Button -->
              <b-button
                class="b-reset op-button-small tertiary m-r-16"
                style="min-width: 128px;"
                tag="nuxt-link"
                :to="`/admin/restaurants/${this.restaurantId()}/menus`"
              >
                <span class="p-l-24 p-r-24">{{ $t("button.cancel") }}</span>
              </b-button>

              <!-- Save Button -->
              <b-button
                class="b-reset op-button-small primary"
                style="min-width: 128px;"
                :disabled="submitting"
                @click="submitItem"
              >
                <span class="c-onprimary p-l-24 p-r-24">
                  {{
                  $t(
                  submitting
                  ? "editCommon.saving"
                  : menuInfo.publicFlag
                  ? "editCommon.save"
                  : "editCommon.saveDraft"
                  )
                  }}
                </span>
              </b-button>
            </div>
          </div>
        </div>
        <!-- Right Gap -->
        <div class="column is-narrow w-24"></div>
      </div>
      <edit-category
        v-if="categoryKey"
        :categoryKey="categoryKey"
        :restaurantInfo="restaurantInfo"
        @dismissed="handleDismissed"
        @updated="handleCategoryUpdated"
      />
    </template>
  </div>
</template>

<script>
import Vue from "vue";
import { db, storage } from "~/plugins/firebase.js";
import NotFound from "~/components/NotFound";
import BackButton from "~/components/BackButton";
import Price from "~/components/Price";
import { taxRates } from "~/plugins/constant.js";
import NotificationIndex from "./Notifications/Index";
import { ownPlateConfig } from "@/config/project";
import { halfCharactors } from "~/plugins/strings.js";
import EditCategory from "~/app/admin/Menus/EditCategory";

export default {
  name: "Order",

  components: {
    Price,
    BackButton,
    NotificationIndex,
    NotFound,
    EditCategory
  },

  data() {
    return {
      menuInfo: {
        itemName: "",
        price: 0,
        tax: "food",
        itemDescription: "",
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
      categoryKey: null
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
  },
  computed: {
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
  watch: {
    hasError: function() {
      this.menuInfo.publicFlag = !this.hasError;
    }
  },
  methods: {
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
        const itemData = {
          itemName: this.menuInfo.itemName,
          price:
            ownPlateConfig.region === "JP"
              ? Math.round(Number(this.menuInfo.price))
              : Number(this.menuInfo.price),
          tax: this.menuInfo.tax,
          itemDescription: this.menuInfo.itemDescription,
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
.croppa-container {
  cursor: pointer;
}
// .croppa-container canvas {
//   border-radius: 4px !important;
//   background: #f00 !important;
// }
</style>
