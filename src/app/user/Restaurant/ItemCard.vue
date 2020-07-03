<template>
  <div>
    <!-- Item Card -->
    <div class="bg-surface r-8 d-low m-t-8" :style="cardStyle">
      <div class="touchable cols" @click="toggleMenuFlag()">
        <div class="flex-1 p-l-16 p-r-16 p-t-16 p-b-16">
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
          >{{ description }}</div>

          <!-- Allergens -->
          <div
            v-if="allergens.length > 0"
            class="t-body2 c-text-black-medium m-t-8"
          >{{ allergensDescription }}</div>
        </div>
        <div class="p-r-16 p-t-16 p-b-16">
          <div class="w-96 is-pulled-right">
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

            <!-- Add Button -->
            <div @click.stop="pushCount" class="op-button-pill bg-primary-bg w-96 t-button">
              <span>{{$t('sitemenu.add')}}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Item Order Details -->
      <div v-if="openMenuFlag" class="m-l-16 m-r-16 p-b-16">
        <hr class="devider m-t-0 m-b-0" />

        <!-- Share Button -->
        <share-popup
          :shopInfo="shopInfo"
          :suffix="urlSuffix"
          class="align-left"
          style="margin-left: -8px;"
        ></share-popup>

        <!-- Item Options -->
        <div v-if="hasOptions" class="m-t-8">
          <div class="t-caption c-text-black-medium">{{$t('sitemenu.options')}}</div>
          <div v-for="(option, index) in options" :key="index" class="m-t-8">
            <div v-if="option.length === 1" class="field">
              <b-checkbox v-model="optionValues[index]">{{ displayOption(option[0]) }}</b-checkbox>
            </div>
            <div v-else class="field">
              <b-radio
                v-for="(choice, index2) in option"
                v-model="optionValues[index]"
                :name="`${item.id}${index}`"
                :native-value="choice"
                :key="index2"
              >{{ displayOption(choice) }}</b-radio>
            </div>
          </div>
        </div>

        <!-- Special instructions -->
        <div v-if="false" class="m-t-16">
          <div class="t-caption c-text-black-medium p-b-8">Special instructions</div>
          <b-input type="textarea" placeholder="Enter special instructions here."></b-input>
          <div
            class="t-caption c-text-black-medium m-l-16 m-r-16 m-t-8"
          >Please note that special requests may result in price adjustment after your order is processed.</div>
        </div>

        <!-- Item Quantity -->
        <div class="m-t-16">
          <div class="t-caption c-text-black-medium">{{$t('sitemenu.quantity')}}</div>
          <div class="level is-mobile m-t-8">
            <div class="level-left">
              <div
                @click="pullCount"
                class="op-button-pill bg-status-red-bg w-96"
                :disabled="count === 0"
              >
                <i class="material-icons c-status-red">remove</i>
              </div>
            </div>
            <div class="t-h4 c-primary">{{ count }}</div>
            <div class="level-right">
              <div @click="pushCount" class="op-button-pill bg-primary-bg w-96">
                <i class="material-icons">add</i>
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
    count: {
      type: Number,
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
    this.optionValues = this.options.map((option, index) => {
      if (
        this.optionPrev &&
        this.optionPrev.length > index &&
        this.optionPrev[index]
      ) {
        if (option.length === 1) {
          return this.optionPrev[index] == option[0]; // checkbox
        }
        return this.optionPrev[index]; // radio button
      }
      return option.length === 1 ? false : option[0];
    });
  },
  watch: {
    optionValues() {
      this.$emit("didOptionValuesChange", {
        id: this.item.id,
        optionValues: this.optionValues
      });
    },
    openMenuFlag() {
      if (this.openMenuFlag && this.count == 0) {
        // this.setCount(this.count + 1);
        this.setCount(this.count + 0); // Only by tapping "Add" will do both open card and add item.
      }
    }
  },
  computed: {
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
    cardStyle() {
      return this.count > 0 ? { border: "solid 2px #0097a7" } : {};
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
    pullCount() {
      if (this.count <= 0) {
        return;
      }
      this.setCount(this.count - 1);
    },
    pushCount() {
      this.setCount(this.count + 1);
      if (!this.openMenuFlag) {
        this.toggleMenuFlag();
      }
    },
    toggleMenuFlag() {
      this.openMenuFlag = !this.openMenuFlag;
    },
    setCount(newValue) {
      this.$emit("didCountChange", { id: this.item.id, count: newValue });
    }
  }
};
</script>
