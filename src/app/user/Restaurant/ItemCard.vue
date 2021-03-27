<template>
  <div>
    <!-- Item Card -->
    <div
      class="bg-white rounded-lg shadow"
      :class="this.totalQuantity > 0 ? 'border-2 border-op-teal' : ''"
    >
      <div @click="toggleMenuFlag()" class="flow-root cursor-pointer">
        <div class="p-4 float-right">
          <!-- Image -->
          <div v-if="image" class="pb-2">
            <img
              @click.stop="openImage()"
              :src="image"
              width="96"
              height="96"
              class="w-24 h-24 rounded cover"
            />
          </div>

          <!-- Add / Sold Out Button -->
          <div>
            <div
              v-if="isSoldOut"
              class="inline-flex justify-center items-center h-9 rounded-full w-24 bg-red-700 bg-opacity-10"
            >
              <div class="text-sm font-bold text-red-700">
                {{ $t("sitemenu.soldOut") }}
              </div>
            </div>
            <div
              v-else
              @click.stop="pushQuantities(0)"
              class="inline-flex justify-center items-center h-9 rounded-full w-24 bg-op-teal bg-opacity-10"
            >
              <div class="text-sm font-bold text-op-teal">
                {{ $t("sitemenu.add") }}
              </div>
            </div>
          </div>
        </div>

        <div class="p-4">
          <!-- Item Name -->
          <div class="text-xl font-bold">{{ title }}</div>

          <!-- Price -->
          <div class="mt-2 text-base">
            <Price :shopInfo="shopInfo" :menu="item" />
          </div>

          <!-- Description -->
          <div v-if="description !== null" class="mt-2 text-sm">
            {{ description }}
          </div>

          <!-- Allergens -->
          <div v-if="allergens.length > 0" class="mt-2 text-xs font-bold">
            {{ allergensDescription }}
          </div>
        </div>
      </div>

      <!-- Item Order Details -->
      <div
        v-if="openMenuFlag"
        class="border-t-2 border-solid border-black border-opacity-10 mt-0 mx-4 pb-4"
      >
        <!-- Share Button -->
        <div class="text-center mt-2">
          <share-popup :shopInfo="shopInfo" :suffix="urlSuffix"></share-popup>
        </div>

        <!-- Item Options -->
        <template v-for="(value, quantityKey) in quantities">
          <div v-if="hasOptions">
            <div class="text-xs">
              {{ $t("sitemenu.options") }}
            </div>

            <div class="grid grid-cols-1 space-y-2 mt-2">
              <div
                v-for="(option, index) in options"
                :key="index"
                class="bg-black bg-opacity-5 rounded-lg p-4"
              >
                <div v-if="option.length === 1" class="field">
                  <b-checkbox v-model="optionValues[quantityKey][index]"
                    ><div class="text-sm font-bold">
                      {{ displayOption(option[0], shopInfo, item) }}
                    </div></b-checkbox
                  >
                </div>
                <div v-else class="field">
                  <b-radio
                    v-for="(choice, index2) in option"
                    v-model="optionValues[quantityKey][index]"
                    :name="`${item.id}_${quantityKey}_${index}`"
                    :native-value="index2"
                    :key="`${quantityKey}_${index2}`"
                    ><div class="text-sm font-bold">
                      {{ displayOption(choice, shopInfo, item) }}
                    </div></b-radio
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Special instructions -->
          <div v-if="false" class="mt-4">
            <div class="text-xs">
              Special instructions
            </div>

            <div class="mt-2">
              <b-input
                type="textarea"
                placeholder="Enter special instructions here."
              ></b-input>
            </div>

            <div class="mt-2 text-xs">
              Please note that special requests may result in price adjustment
              after your order is processed.
            </div>
          </div>

          <!-- Item Quantity / Sold Out -->
          <div class="mt-4">
            <div v-if="isSoldOut">
              <div
                class="flex justify-center items-center h-9 rounded-full bg-red-700 bg-opacity-10"
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
                      :menu="{ price: prices[quantityKey] }"
                    />
                  </div>
                </div>
                <div></div>
              </div>

              <div class="mt-2 flex items-center">
                <div>
                  <a
                    @click="pullQuantities(quantityKey)"
                    class="inline-flex justify-center items-center h-9 w-24 rounded-full bg-red-700 bg-opacity-10"
                    :disabled="quantities[quantityKey] === 0"
                  >
                    <i class="material-icons text-lg text-red-700">remove</i>
                  </a>
                </div>
                <div class="flex-1 text-center text-3xl text-op-teal">
                  {{ quantities[quantityKey] }}
                </div>
                <div>
                  <a
                    @click="pushQuantities(quantityKey)"
                    class="inline-flex justify-center items-center h-9 w-24 rounded-full bg-op-teal bg-opacity-10"
                  >
                    <i class="material-icons text-lg text-op-teal">add</i>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div
            class="border-t-2 border-solid border-black border-opacity-10 mt-4 pb-4"
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
                class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
              >
                <i class="material-icons text-lg text-op-teal mr-2">add</i>
                <span class="text-sm font-bold text-op-teal">{{
                  $t("sitemenu.addDifferentOptionsItem")
                }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Popup-->
    <b-modal :active.sync="imagePopup" :width="488" scroll="keep">
      <div class="px-2 text-center" @click.stop="closeImage()">
        <img :src="image" class="rounded-lg shadow-lg" />
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import Price from "~/components/Price";
import SharePopup from "~/app/user/Restaurant/SharePopup";

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
    // # Not In Use
    // cardStyle() {
    //   return this.totalQuantity > 0 ? { border: "solid 2px #0097a7" } : {};
    // },
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
