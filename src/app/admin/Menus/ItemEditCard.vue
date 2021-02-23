<template>
  <div>
    <!-- Item Card -->
    <div class="bg-surface r-8 d-low m-t-8">
      <!-- Published/NotPublished Badge -->
      <div class="cols flex-center">
        <div class="flex-1">
          <div v-if="menuitem.publicFlag" class="p-t-8 p-l-8 p-r-8 p-b-8">
            <div
              class="bg-status-green-bg c-status-green t-overline p-l-8 p-r-8 p-t-4 p-b-4 r-4"
            >
              {{ $t("admin.itemPublished") }}
            </div>
          </div>
          <div v-else class="p-t-8 p-l-8 p-r-8 p-b-8">
            <div
              class="bg-status-red-bg c-status-red t-overline p-l-8 p-r-8 p-t-4 p-b-4 r-4"
            >
              {{ $t("admin.itemNotPublished") }}
            </div>
          </div>
        </div>
        <div class="p-r-16">
          <b-checkbox :value="soldOut" @input="soldOutToggle">
            <div v-if="soldOut" class="t-button c-status-red">
              {{ $t("admin.itemSoldOut") }}
            </div>
            <div v-else class="t-button c-text-black-disabled">
              {{ $t("admin.itemSoldOut") }}
            </div>
          </b-checkbox>
        </div>
      </div>

      <!-- Item Details -->
      <div class="is-clearfix touchable" @click="linkEdit">
        <div class="p-r-16 p-t-16 p-b-16 p-l-16 is-pulled-right">
          <div v-if="image" class="p-b-8">
            <img
              :src="image"
              width="96"
              height="96"
              class="w-24 h-24 r-4 cover"
            />
          </div>
        </div>
        <div class="p-l-16 p-r-16 p-t-16 p-b-16">
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
      </div>

      <!-- Owner Memo -->
      <div v-if="menuitem.itemMemo" class="p-l-8 p-r-8 p-b-8">
        <div
          class="bg-form t-overline c-text-black-medium p-l-8 p-r-8 p-t-4 p-b-4 r-4"
        >
          {{ menuitem.itemMemo.split("\n")[0] }}
        </div>
      </div>
    </div>

    <!-- Card Actions -->
    <div class="m-t-8 p-b-8 p-l-8 p-r-8">
      <div class="cols">
        <div class="flex-1">
          <!-- Position Up -->
          <b-button
            class="b-reset op-button-pill h-9 bg-form m-r-8"
            v-if="position !== 'first'"
            @click="positionUp"
          >
            <i class="material-icons c-primary s-18 p-l-8 p-r-8"
              >arrow_upward</i
            >
          </b-button>
          <!-- Disable if First -->
          <b-button
            class="b-reset op-button-pill h-9 bg-form m-r-8"
            disabled
            v-else
          >
            <i class="material-icons c-text-black-disabled s-18 p-l-8 p-r-8"
              >arrow_upward</i
            >
          </b-button>

          <!-- Position Down -->
          <b-button
            class="b-reset op-button-pill h-9 bg-form m-r-8"
            v-if="position !== 'last'"
            @click="positionDown"
          >
            <i class="material-icons c-primary s-18 p-l-8 p-r-8"
              >arrow_downward</i
            >
          </b-button>
          <!-- Disable if Last -->
          <b-button
            class="b-reset op-button-pill h-9 bg-form m-r-8"
            disabled
            v-else
          >
            <i class="material-icons c-text-black-disabled s-18 p-l-8 p-r-8"
              >arrow_downward</i
            >
          </b-button>

          <!-- Duplicate -->
          <b-button
            class="b-reset op-button-pill h-9 bg-form m-r-8"
            @click="forkItem"
          >
            <i class="material-icons c-primary s-18 p-l-8 p-r-8">queue</i>
          </b-button>
        </div>
        <div>
          <b-button
            class="b-reset op-button-pill h-9 bg-form"
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
import { db } from "~/plugins/firebase.js";
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
    },
    soldOut() {
      return !!this.menuitem.soldOut; // = !soldOut;
    }
  },
  data() {
    return {
      counter: 0
    };
  },
  methods: {
    soldOutToggle(e) {
      const path = `restaurants/${this.restaurantId()}/menus/${
        this.menuitem.id
      }`;
      db.doc(path).update("soldOut", e);
    },
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
