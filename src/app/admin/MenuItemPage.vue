<template>
  <div>
    <template v-if="notFound==null"></template>
    <template v-else-if="notFound">
      <not-found />
    </template>
    <template v-else>
      <section class="section">
        <back-button :url="`/admin/restaurants/${this.restaurantId()}/menus`" />

        <h2 class="p-big bold">{{$t("editMenu.item")}}</h2>
        <div class="media">
          <div class="media-content"></div>
          <div class="media-right">
            <p class="p-small bold" style="color:#CB4B4B">* {{$t("editMenu.required")}}</p>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-body">
            <h4>
              {{$t("editMenu.itemName")}}
              <span class="p-small" style="color:#CB4B4B">*</span>
            </h4>
          </div>
        </div>
        <b-field>
          <b-field :type="errors['itemName'].length > 0 ? 'is-danger' : 'is-success'">
            <b-input v-model="menuInfo.itemName" :placeholder="$t('editMenu.enterItemName')"></b-input>
          </b-field>
        </b-field>
        <div class="columns">
          <div class="column is-half">
            <div class="field is-horizontal">
              <div class="field-body">
                <h4>
                  {{$t("editMenu.price")}}
                  <span class="p-small" style="color:#CB4B4B">*</span>
                </h4>
              </div>
            </div>
            <b-field :type="errors['price'].length > 0 ? 'is-danger' : 'is-success'">
              <b-input
                v-model="menuInfo.price"
                type="number"
                :step="priceStep"
                placeholder="00.00"
                :max="maxPrice"
                min="0.00"
                expanded
              ></b-input>
              <p class="control">
                <span class="button is-static">{{$t("currency." + this.currencyKey)}}</span>
              </p>
            </b-field>
          </div>
          <div class="column is-half">
            <div class="field is-horizontal">
              <div class="field-body">
                <h4>
                  {{$t("editMenu.tax")}}
                  <span class="p-small" style="color:#CB4B4B">*</span>
                </h4>
              </div>
            </div>
            <b-field :type="errors['tax'].length > 0 ? 'is-danger' : 'is-success'">
              <b-select v-model="menuInfo.tax" placeholder="select">
                <option
                  v-for="taxItem in taxRates"
                  :value="taxItem"
                  :key="taxItem"
                >{{ restaurantInfo && ((restaurantInfo[taxItem + "Tax"] || 0) + "%") }} - {{ $t("editMenu." + taxRateKeys[taxItem]) }}</option>
              </b-select>
            </b-field>
          </div>
        </div>
        <div class="field is-horizontal" v-if="requireTaxPriceDisplay">
          <span class="h4">{{$t('editMenu.displayPrice')}}</span>
          <span style="line-height: 1.125rem;">
            :
            <Price :shopInfo="restaurantInfo" :menu="menuInfo" />
          </span>
        </div>

        <div class="field is-horizontal">
          <div class="field-body">
            <h4>{{$t('allergens.title')}}</h4>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-body">
            <b-checkbox
              v-for="allergen in allergens"
              v-model="menuInfo.allergens[allergen]"
              :key="allergen"
            >{{$t(`allergens.${allergen}`)}}</b-checkbox>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-body">
            <h4>{{$t("editMenu.itemDescription")}}</h4>
          </div>
        </div>
        <b-field :type="errors['itemDescription'].length > 0 ? 'is-danger' : 'is-success'">
          <b-input
            v-model="menuInfo.itemDescription"
            :placeholder="$t('editMenu.enterItemDescription')"
          ></b-input>
        </b-field>

        <div class="field is-horizontal">
          <div class="field-body">
            <h4>{{$t("editMenu.itemPhoto")}}</h4>
          </div>
        </div>

        <table style="margin-bottom:0.5rem">
          <tr>
            <td v-if="itemPhoto">{{$t('editCommon.current')}}</td>
            <td>{{$t('editCommon.new')}}</td>
          </tr>
          <tr>
            <td v-if="itemPhoto">
              <img class="card_image" :src="itemPhoto" />
            </td>
            <td>
              <croppa
                :prevent-white-space="true"
                :zoom-speed="5"
                :accept="'image/jpeg'"
                :placeholder="$t('editCommon.clickAndUpload')"
                :placeholder-font-size="10"
                :disable-drag-to-move="true"
                :disable-scroll-to-zoom="true"
                :disable-rotation="true"
                initial-position="center"
                :canvas-color="'gainsboro'"
                @file-choose="handleMenuImage"
              ></croppa>
            </td>
          </tr>
        </table>

        <div class="field is-horizontal">
          <div class="field-body">
            <h4>{{$t("editMenu.itemOptions")}}</h4>
          </div>
        </div>
        <p style="font-size:0.9em">{{$t('editMenu.itemOptionsNote')}}</p>
        <template v-for="(option, key) in menuInfo.itemOptionCheckbox">
          <div :style="{display: 'inline-flex', width: '100%'}" :key="key">
            <b-input
              v-model="menuInfo.itemOptionCheckbox[key]"
              :placeholder="$t('editMenu.enterItemOption')"
              :style="{width: '95%'}"
            />
            <span @click="deleteOption(key)">
              <b-icon icon="delete" size="is-midium" />
            </span>
          </div>
          <br />
        </template>
        <span @click="addOption">
          <b-icon icon="plus" size="is-midium"></b-icon>
          {{$t("editMenu.itemAddOption")}}
        </span>
        <br />

        <div style="margin-top:0.5rem;margin-bottom:1rem">
          <b-checkbox
            v-model="menuInfo.publicFlag"
            :disabled="hasError"
            :type="!menuInfo.publicFlag ? 'is-danger' : ''"
          >{{$t('shopInfo.public')}}</b-checkbox>
          <br />
          <span v-if="hasError" class="p-font bold" style="color:#CB4B4B">
            {{$t('editRestaurant.draftWarning')}}
            <br />
          </span>
          <span style="color:#CB4B4B" v-if="!menuInfo.publicFlag && !hasError">
            {{$t("editMenu.saveAsDraft")}}
            <br />
          </span>
        </div>

        <b-button
          style="margin-right:auto"
          type="is-primary"
          class="counter-button"
          expanded
          rounded
          :disabled="submitting"
          @click="submitItem"
        >{{$t(submitting ? 'editCommon.saving' : (menuInfo.publicFlag ? "editCommon.save" : "editCommon.saveDraft"))}}</b-button>
      </section>
    </template>
  </div>
</template>

<script>
import Vue from "vue";
import { db, storage } from "~/plugins/firebase.js";

import NotFound from "~/components/NotFound";
import BackButton from "~/components/BackButton";

import { taxRates, regionalSettings } from "~/plugins/constant.js";
import { ownPlateConfig } from "@/config/project";

import Price from "~/components/Price";

export default {
  name: "Order",

  components: {
    Price,
    BackButton,
    NotFound
  },

  data() {
    const regionalSetting = regionalSettings[ownPlateConfig.region || "US"];
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
        allergens: {}
      },

      taxRates: taxRates,
      taxRateKeys: regionalSetting["taxRateKeys"],
      requireTaxPriceDisplay: regionalSetting.requireTaxPriceDisplay,

      currencyKey: regionalSetting["CurrencyKey"],

      maxPrice: 1000000.0 / this.$store.getters.stripeRegion.multiple,

      restaurantInfo: {},
      notFound: null,
      menuId: this.$route.params.menuId,
      submitting: false,
      files: {}
    };
  },
  async created() {
    this.checkAdminPermission();

    const restaurantRef = db.doc(`restaurants/${this.restaurantId()}`);
    const resRestInfo = await restaurantRef.get();
    if (!resRestInfo.exists) {
      this.notFound = true;
      console.log("no restaurant");
      return;
    }
    this.restaurantInfo = resRestInfo.data();

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
          price: Number(this.menuInfo.price),
          tax: this.menuInfo.tax,
          itemDescription: this.menuInfo.itemDescription,
          itemPhoto: this.menuInfo.itemPhoto,
          images: {
            item: this.menuInfo.images.item || {}
          },
          itemOptionCheckbox: this.menuInfo.itemOptionCheckbox || [],
          publicFlag: this.menuInfo.publicFlag || false,
          allergens: this.menuInfo.allergens,
          validatedFlag: !this.hasError
        };
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
.card_image {
  height: 200px;
}
.h4 {
  font-weight: 600;
  line-height: 1.125rem;
  font-size: 1rem !important;
  color: #212121;
}
</style>
