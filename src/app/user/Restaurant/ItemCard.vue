<template>
  <div>
    <!-- Item Card -->
    <div class="bg-surface r-8 d-low m-t-8" :style="cardStyle">
      <div class="touchable is-clearfix" @click="toggleMenuFlag()">
        <div class="p-r-16 p-t-16 p-b-16 p-l-16 is-pulled-right">
          <!-- Image -->
          <div v-if="image" class="p-b-8">
            <img
              @click.stop="openImage()"
              :src="image"
              width="96"
              height="96"
              class="w-96 h-96 r-4 cover"
            />
          </div>

          <!-- Add / Sold Out Button -->
          <div
            v-if="isSoldOut"
            class="bg-status-red-bg w-96 h-36 r-32 t-button is-flex"
            style="flex-direction: column; justify-content: center"
          >
            <div class="c-status-red align-center">
              {{ $t("sitemenu.soldOut") }}
            </div>
          </div>
          <div
            v-else
            @click.stop="pushQuantities(0)"
            class="op-button-pill bg-primary-bg w-96 t-button"
          >
            <span>{{ $t("sitemenu.add") }}</span>
          </div>
        </div>

        <div class="p-l-16 p-r-16 p-t-16 p-b-16">
          <!-- Item Name -->
          <div class="t-h6 c-text-black-high">{{ title }}</div>

          <!-- Price -->
          <div class="t-body1 c-text-black-high m-t-8">
            <Price :shopInfo="shopInfo" :menu="item" />
          </div>

          <!-- Description -->
          <div
            v-if="description !== null"
            class="t-body2 c-text-black-medium m-t-8"
          >
            {{ description }}
          </div>

          <!-- Allergens -->
          <div
            v-if="allergens.length > 0"
            class="t-body2 c-text-black-medium m-t-8"
          >
            {{ allergensDescription }}
          </div>
        </div>
      </div>

      <!-- Item Order Details -->
      <div v-if="openMenuFlag" class="m-l-16 m-r-16 p-b-16">
        <hr class="devider m-t-0 m-b-0" />

        <!-- Share Button -->
        <div class="align-center m-t-8">
          <share-popup :shopInfo="shopInfo" :suffix="urlSuffix"></share-popup>
        </div>

        <!-- Item Options -->
        <template v-for="(value, quantityKey) in quantities">
          <div v-if="hasOptions" class="m-t-8">
            <div class="t-caption c-text-black-medium">
              {{ $t("sitemenu.options") }}
            </div>
            <div
              v-for="(option, index) in options"
              :key="index"
              class="m-t-8 bg-form p-t-16 p-l-16 p-r-16 p-b-16 r-8"
            >
              <div v-if="option.length === 1" class="field">
                <b-checkbox v-model="optionValues[quantityKey][index]">{{
                  displayOption(option[0])
                }}</b-checkbox>
              </div>
              <div v-else class="field">
                <b-radio
                  v-for="(choice, index2) in option"
                  v-model="optionValues[quantityKey][index]"
                  :name="`${item.id}_${quantityKey}_${index}`"
                  :native-value="index2"
                  :key="`${quantityKey}_${index2}`"
                  >{{ displayOption(choice) }}</b-radio
                >
              </div>
            </div>
          </div>

          <!-- Special instructions -->
          <div v-if="false" class="m-t-16">
            <div class="t-caption c-text-black-medium p-b-8">
              Special instructions
            </div>
            <b-input
              type="textarea"
              placeholder="Enter special instructions here."
            ></b-input>
            <div class="t-caption c-text-black-medium m-l-16 m-r-16 m-t-8">
              Please note that special requests may result in price adjustment
              after your order is processed.
            </div>
          </div>

          <!-- Item Quantity / Sold Out -->
          <div
            v-if="isSoldOut"
            class="bg-status-red-bg h-36 r-32 t-button is-flex m-t-16"
            style="flex-direction: column; justify-content: center"
          >
            <div class="c-status-red align-center">
              {{ $t("sitemenu.soldOut") }}
            </div>
          </div>
          <div v-else class="m-t-16">
            <div class="level is-mobile m-t-8">
              <div class="level-left">
                <div class="t-caption c-text-black-medium">
                  {{ $t("sitemenu.quantity") }}
                </div>
              </div>

              <div class="level-right">
                <div
                  v-if="prices[quantityKey] > 0"
                  class="t-caption c-text-black-medium"
                >
                  {{ $t("sitemenu.subTotal")
                  }}<Price
                    :shopInfo="shopInfo"
                    :menu="{ price: prices[quantityKey] }"
                  />
                </div>
              </div>
            </div>

            <div class="level is-mobile m-t-8">
              <div class="level-left">
                <div
                  @click="pullQuantities(quantityKey)"
                  class="op-button-pill bg-status-red-bg w-96"
                  :disabled="quantities[quantityKey] === 0"
                >
                  <i class="material-icons c-status-red">remove</i>
                </div>
              </div>
              <div class="t-h4 c-primary">{{ quantities[quantityKey] }}</div>
              <div class="level-right">
                <div
                  @click="pushQuantities(quantityKey)"
                  class="op-button-pill bg-primary-bg w-96"
                >
                  <i class="material-icons">add</i>
                </div>
              </div>
            </div>
          </div>
          <hr class="devider m-t-16 m-b-0" v-if="showMoreOption" />
        </template>

        <!-- Another Order with Different Options -->
        <div>
          <!-- # Enable this section If "hasOptions" and more than one order in the default section above. -->
          <!-- # Show only "Add Another Order Button" first, then add "Another Order" section with the item quantities +1 when the button tapped.  -->
          <!-- # Once user removed the item to quantities 0, the "Another Order" section will be removed. -->

          <!-- Add Another Order Button -->
          <div v-if="showMoreOption">
            <div class="align-center m-t-16">
              <div @click="pushItem" class="op-button-pill bg-form">
                <i class="material-icons">add</i>
                <span class="t-button">{{
                  $t("sitemenu.addDifferentOptionsItem")
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Popup-->
    <b-modal :active.sync="imagePopup" :width="488" scroll="keep">
      <div class="align-center p-l-8 p-r-8" @click.stop="closeImage()">
        <img :src="image" class="r-8 d-medium" />
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import Price from "~/components/Price";
import SharePopup from "~/app/user/Restaurant/SharePopup";
import { formatOption } from "~/plugins/strings.js";

// menu UI algorithm
//   init quantities = [0]
//   if sum(quantities) > 0, show button
//   if button push, quantities.push(1)
//   when update quantities, if there is 0 element in quantities and quantities.size > 0, filter 0 element in quantities.

export default {
  components: {
    Price,
    SharePopup
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    shopInfo: {
      type: Object,
      required: true
    },
    quantities: {
      type: Array,
      required: true
    },
    initialOpenMenuFlag: {
      type: Boolean,
      required: true
    },
    optionPrev: {
      type: Array,
      required: false
    },
    isOpen: {
      type: Boolean,
      required: true
    },
    prices: {
      type: Array,
      required: true
    }
  },
  mounted() {
    if (this.isOpen) {
      this.openImage();
    }
  },
  data() {
    return {
      openMenuFlag: this.initialOpenMenuFlag,
      optionValues: [],
      imagePopup: false,
      urlSuffix: "/menus/" + this.item.id
    };
  },
  created() {
    //console.log("created", this.optionPrev);
    Object.keys(this.quantities).forEach(key => {
      const v = this.options.map((option, index) => {
        if (
          this.optionPrev &&
          this.optionPrev[key] &&
          this.optionPrev[key].length > index &&
          this.optionPrev[key][index]
        ) {
          return this.optionPrev[key][index];
        }
        return option.length === 1 ? false : 0;
      });
      this.optionValues.push(v);
    });
  },
  watch: {
    optionValues: {
      handler: function(val) {
        console.log("opt: " + JSON.stringify(val));
        this.$emit("didOptionValuesChange", {
          id: this.item.id,
          optionValues: this.optionValues
        });
      },
      deep: true
    },
    openMenuFlag() {
      if (this.openMenuFlag && this.quantities[0] == 0) {
        this.setQuantities(this.quantities + 0); // Only by tapping "Add" will do both open card and add item.
      }
    }
  },
  computed: {
    isSoldOut() {
      return !!this.item.soldOut;
    },
    totalQuantity() {
      return this.arraySum(this.quantities);
    },
    allergensDescription() {
      return (
        this.$t("allergens.title") +
        ": " +
        this.allergens
          .map(allergen => {
            return this.$t(`allergens.${allergen}`);
          })
          .join(this.$t("comma"))
      );
    },
    allergens() {
      if (this.item.allergens) {
        return Object.keys(this.item.allergens).filter(allergen => {
          return this.item.allergens[allergen];
        });
      }
      return [];
    },
    options() {
      // HACK: Dealing with a special case (probalby a bug in the menu editor)
      if (
        this.item.itemOptionCheckbox &&
        this.item.itemOptionCheckbox.length === 1 &&
        !this.item.itemOptionCheckbox[0]
      ) {
        console.log("Special case: itemOptionCheckbox===['']");
        return [];
      }
      return (this.item.itemOptionCheckbox || []).map(option => {
        return option.split(",").map(choice => {
          return choice.trim();
        });
      });
    },
    hasOptions() {
      return this.options.length;
    },
    showMoreOption() {
      return this.totalQuantity > 0 && this.hasOptions;
    },
    cardStyle() {
      return this.totalQuantity > 0 ? { border: "solid 2px #0097a7" } : {};
    },
    loopNumber() {
      return this.quantities;
    },
    price() {
      return Number(this.item.price || 0);
    },
    image() {
      return (
        (this.item?.images?.item?.resizedImages || {})["600"] ||
        this.item.itemPhoto
      );
    },
    title() {
      return this.item.itemName;
    },
    description() {
      return this.item.itemDescription;
    }
  },
  methods: {
    displayOption(option) {
      return formatOption(option, price => this.$n(price, "currency"));
    },
    openImage() {
      this.imagePopup = true;
      // this.$router.replace("/r/" + this.restaurantId() + (this.urlSuffix||""));
    },
    closeImage() {
      this.imagePopup = false;
      // this.$router.replace("/r/" + this.restaurantId());
    },
    pullQuantities(key) {
      if (this.quantities[key] <= 0) {
        return;
      }
      this.setQuantities(key, this.quantities[key] - 1);
    },
    pushQuantities(key) {
      this.setQuantities(key, this.quantities[key] + 1);
      if (!this.openMenuFlag) {
        this.toggleMenuFlag();
      }
    },
    toggleMenuFlag() {
      this.openMenuFlag = !this.openMenuFlag;
    },
    setQuantities(key, newValue) {
      const newQuantities = [...this.quantities];
      newQuantities[key] = newValue;
      if (newQuantities[key] === 0 && newQuantities.length > 1) {
        newQuantities.splice(key, 1);

        const newOP = [...this.optionValues];
        newOP.splice(key, 1);
        this.optionValues = newOP;
      }
      this.$emit("didQuantitiesChange", {
        id: this.item.id,
        quantities: newQuantities
      });
    },
    pushItem() {
      this.optionValues.push(
        this.options.map((option, index) => {
          return option.length === 1 ? false : 0;
        })
      );

      const newQuantities = [...this.quantities];
      newQuantities.push(1);
      this.$emit("didQuantitiesChange", {
        id: this.item.id,
        quantities: newQuantities
      });
    }
  }
};
</script>
