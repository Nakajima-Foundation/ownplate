<template>
  <div class="lg:flex">
    <div class="lg:flex-1">
      <!-- Item Card -->
      <div class="bg-white rounded-lg shadow">
        <!-- Published Status and Sold Out Checkbox -->
        <div class="flex items-center">
          <div class="flex-1 mx-2 mt-2">
            <div
              v-if="menuitem.publicFlag"
              class="p-2 rounded bg-opacity-10 bg-green-600"
            >
              <div class="text-xs font-bold text-green-600">
                {{ $t("admin.itemPublished") }}
              </div>
            </div>
            <div v-else class="p-2 rounded bg-opacity-10 bg-red-700">
              <div class="text-xs font-bold text-red-700">
                {{ $t("admin.itemNotPublished") }}
              </div>
            </div>
          </div>

          <div class="mr-4 pt-4">
            <b-checkbox :value="soldOut" @input="soldOutToggle">
              <div v-if="soldOut" class="text-sm font-bold text-red-700">
                {{ $t("admin.itemSoldOut") }}
              </div>
              <div v-else class="text-sm font-bold text-black text-opacity-30">
                {{ $t("admin.itemSoldOut") }}
              </div>
            </b-checkbox>
          </div>
        </div>

        <!-- Item Details -->
        <a class="flow-root" @click="linkEdit">
          <div class="p-4 float-right">
            <div v-if="image">
              <img
                :src="image"
                width="96"
                height="96"
                class="w-24 h-24 rounded object-cover"
              />
            </div>
          </div>

          <div class="p-4">
            <div class="text-xl font-bold text-black text-opacity-80">
              {{ menuitem.itemName }}
            </div>
            <div class="text-base text-black text-opacity-80 mt-2">
              <Price :shopInfo="shopInfo" :menu="menuitem" />
            </div>

            <!-- # Remove the description part to make the list length shorter -->
            <!-- <div class="mt-2 text-sm text-black text-opacity-60">
            {{ menuitem.itemDescription }}
          </div> -->
          </div>
        </a>

        <!-- Owner Memo -->
        <div v-if="menuitem.itemMemo" class="mx-2 pb-2">
          <div class="p-2 rounded bg-black bg-opacity-5 text-xs">
            {{ menuitem.itemMemo.split("\n")[0] }}
          </div>
        </div>
      </div>
    </div>

    <div
      class="mt-2 text-right lg:mt-0 lg:ml-4 lg:flex-shrink-0"
      v-if="isOwner"
    >
      <!-- Card Actions -->
      <div class="inline-flex space-x-2">
        <!-- Up -->
        <b-button
          v-if="position !== 'first'"
          @click="positionUp"
          class="b-reset-tw"
        >
          <div
            class="inline-flex justify-center items-center px-4 h-9 rounded-full bg-black bg-opacity-5"
          >
            <i class="material-icons text-lg text-op-teal">arrow_upward</i>
          </div>
        </b-button>
        <b-button v-else disabled class="b-reset-tw">
          <div
            class="inline-flex justify-center items-center px-4 h-9 rounded-full bg-black bg-opacity-5"
          >
            <i class="material-icons text-lg text-op-teal">arrow_upward</i>
          </div>
        </b-button>

        <!-- Down -->
        <b-button
          v-if="position !== 'last'"
          @click="positionDown"
          class="b-reset-tw"
        >
          <div
            class="inline-flex justify-center items-center px-4 h-9 rounded-full bg-black bg-opacity-5"
          >
            <i class="material-icons text-lg text-op-teal">arrow_downward</i>
          </div>
        </b-button>
        <b-button v-else disabled class="b-reset-tw">
          <div
            class="inline-flex justify-center items-center px-4 h-9 rounded-full bg-black bg-opacity-5"
          >
            <i class="material-icons text-lg text-op-teal">arrow_downward</i>
          </div>
        </b-button>

        <!-- Duplicate -->
        <b-button @click="forkItem" class="b-reset-tw">
          <div
            class="inline-flex justify-center items-center px-4 h-9 rounded-full bg-black bg-opacity-5"
          >
            <i class="material-icons text-lg text-op-teal">queue</i>
          </div>
        </b-button>

        <!-- Delete -->
        <b-button @click="deleteItem" class="b-reset-tw">
          <div
            class="inline-flex justify-center items-center px-4 h-9 rounded-full bg-black bg-opacity-5"
          >
            <i class="material-icons text-lg text-red-700">delete</i>
          </div>
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "@/plugins/firebase";
import store from "@/store/index.js";
import Price from "@/components/Price";

export default {
  components: {
    Price,
  },
  props: {
    menuitem: {
      type: Object,
      required: true,
    },
    shopInfo: {
      type: Object,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
  },
  computed: {
    isOwner() {
      return !this.$store.getters.isSubAccount;
    },
    image() {
      return (
        (this.menuitem?.images?.item?.resizedImages || {})["600"] ||
        this.menuitem.itemPhoto
      );
    },
    soldOut() {
      return !!this.menuitem.soldOut; // = !soldOut;
    },
  },
  data() {
    return {
      counter: 0,
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
      if (this.isOwner) {
        this.$router.push({
          path: `/admin/restaurants/${this.restaurantId()}/menus/${
            this.menuitem.id
          }`,
        });
      }
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
        },
      });
    },
  },
};
</script>
