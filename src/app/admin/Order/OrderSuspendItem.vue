<template>
  <div>
    <!-- Item Card -->
    <div class="bg-surface r-8 d-low m-t-8" :style="cardStyle">
      <div class="cols">
        <div class="flex-1 p-l-16 p-r-16 p-t-16 p-b-16">
          <!-- Suspend Checkbox -->
          <div class="m-b-16">
            <b-checkbox v-model="suspend">
              <span class="t-button" :style="suspendText">{{ $t("admin.order.suspend") }}</span>
            </b-checkbox>
          </div>

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
import Price from "~/components/Price";

export default {
  components: {
    Price
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    shopInfo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      imagePopup: false,
      suspend: false
    };
  },

  computed: {
    cardStyle() {
      return this.suspend
        ? { border: "solid 2px #b00020", background: "rgba(176, 0, 32, 0.1)" }
        : {};
    },
    suspendText() {
      return this.suspend ? { color: "#b00020" } : {};
    },
    title() {
      return this.item.itemName;
    },
    price() {
      return Number(this.item.price || 0);
    },
    description() {
      return this.item.itemDescription;
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
    image() {
      return (
        (this.item?.images?.item?.resizedImages || {})["600"] ||
        this.item.itemPhoto
      );
    }
  },
  methods: {
    openImage() {
      this.imagePopup = true;
    },
    closeImage() {
      this.imagePopup = false;
    }
  }
};
</script>
