<template>
  <div>
    <!-- Item Card -->
    <div class="bg-surface r-8 d-low m-t-8">
      <div class="touchable cols" @click="linkEdit">
        <div class="flex-1 p-l-16 p-r-16 p-t-16 p-b-16">
          <div class="t-h6 c-text-black-high">{{ menuitem.itemName }}</div>
          <div class="t-body1 c-text-black-high m-t-8">
            <Price :shopInfo="shopInfo" :menu="menuitem" />
          </div>

          <!-- # Need to add *** v-if="menuitem.itemDescription !== null" ***? -->
          <div class="t-body2 c-text-black-medium m-t-8">
            {{ menuitem.itemDescription }}
          </div>

          <!-- # Need to add allergensDescription -->
          <!-- <div
            v-if="menuitem.allergens.length > 0"
            class="t-body2 c-text-black-medium m-t-8"
          >{{ menuitem.allergensDescription }}</div>-->
        </div>
        <div class="p-r-16 p-t-16 p-b-16">
          <div class="w-96 is-pulled-right">
            <div v-if="image" class="p-b-8">
              <img
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

    <!-- Card Actions -->
    <div class="m-t-8 p-b-8 p-l-8 p-r-8">
      <div class="cols">
        <div class="flex-1">
          <!-- Position Up -->
          <b-button
            class="b-reset op-button-pill h-36 bg-primary-bg m-r-8"
            v-if="position !== 'first'"
            @click="positionUp"
          >
            <i class="material-icons c-primary s-18 p-l-8 p-r-8"
              >arrow_upward</i
            >
          </b-button>
          <!-- Disable if First -->
          <b-button
            class="b-reset op-button-pill h-36 bg-primary-bg m-r-8"
            disabled
            v-else
          >
            <i class="material-icons c-text-black-disabled s-18 p-l-8 p-r-8"
              >arrow_upward</i
            >
          </b-button>

          <!-- Position Down -->
          <b-button
            class="b-reset op-button-pill h-36 bg-primary-bg m-r-8"
            v-if="position !== 'last'"
            @click="positionDown"
          >
            <i class="material-icons c-primary s-18 p-l-8 p-r-8"
              >arrow_downward</i
            >
          </b-button>
          <!-- Disable if Last -->
          <b-button
            class="b-reset op-button-pill h-36 bg-primary-bg m-r-8"
            disabled
            v-else
          >
            <i class="material-icons c-text-black-disabled s-18 p-l-8 p-r-8"
              >arrow_downward</i
            >
          </b-button>

          <!-- Duplicate -->
          <b-button
            class="b-reset op-button-pill h-36 bg-primary-bg m-r-8"
            @click="forkItem"
          >
            <i class="material-icons c-primary s-18 p-l-8 p-r-8">queue</i>
          </b-button>
        </div>
        <div>
          <b-button
            class="b-reset op-button-pill h-36 bg-status-red-bg"
            @click="deleteItem"
          >
            <i class="material-icons c-status-red s-18 p-l-8 p-r-8">delete</i>
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import store from "~/store/index.js";
import Price from "~/components/Price";

export default {
  components: {
    Price
  },
  props: {
    menuitem: {
      type: Object,
      required: true
    },
    shopInfo: {
      type: Object,
      required: true
    },
    position: {
      type: String,
      required: true
    }
  },
  computed: {
    image() {
      return (
        (this.menuitem?.images?.item?.resizedImages || {})["600"] ||
        this.menuitem.itemPhoto
      );
    }
  },
  data() {
    console.log(this.shopInfo);
    return {
      counter: 0
    };
  },
  methods: {
    linkEdit() {
      this.$router.push({
        path: `/admin/restaurants/${this.restaurantId()}/menus/${
          this.menuitem.id
        }`
      });
    },
    positionUp() {
      this.$emit("positionUp", this.menuitem.id);
    },
    positionDown() {
      this.$emit("positionDown", this.menuitem.id);
    },
    forkItem() {
      this.$emit("forkItem", this.menuitem.id);
    },
    deleteItem() {
      // this.$emit("deleteItem", this.menuitem.id);
      this.$store.commit("setAlert", {
        code: "editMenu.reallyDelete",
        callback: () => {
          this.$emit("deleteItem", this.menuitem.id);
        }
      });
    }
  }
};
</script>
