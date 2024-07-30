<template>
  <div class="lg:flex">
    <div class="lg:flex-1">
      <!-- Item Card -->
      <div class="rounded-lg bg-white shadow">
        <!-- Published Status and Sold Out Checkbox -->
        <div class="flex items-center">
          <div class="mx-2 mt-2 flex-1">
            <div
              v-if="menuitem.publicFlag"
              class="rounded bg-green-600 bg-opacity-10 p-2"
            >
              <div class="text-xs font-bold text-green-600">
                {{ $t("admin.itemPublished") }}
              </div>
            </div>
            <div v-else class="rounded bg-red-700 bg-opacity-10 p-2">
              <div class="text-xs font-bold text-red-700">
                {{ $t("admin.itemNotPublished") }}
              </div>
            </div>
          </div>

          <div class="mr-4 pt-4">
            <o-checkbox
              :modelValue="soldOut"
              @update:modelValue="soldOutToggle"
            >
              <div v-if="soldOut" class="text-sm font-bold text-red-700">
                {{ $t("admin.itemSoldOut") }}
              </div>
              <div v-else class="text-sm font-bold text-black text-opacity-30">
                {{ $t("admin.itemSoldOut") }}
              </div>
            </o-checkbox>
          </div>
          <div class="mr-4 pt-4">
            <o-checkbox
              :modelValue="soldOutToday"
              @update:modelValue="soldOutTodayToggle"
            >
              <div v-if="soldOut" class="text-sm font-bold text-red-700">
                {{ $t("admin.itemSoldOutToday") }}
              </div>
              <div v-else class="text-sm font-bold text-black text-opacity-30">
                {{ $t("admin.itemSoldOutToday") }}
              </div>
            </o-checkbox>
          </div>
        </div>

        <!-- Item Details -->
        <a class="flow-root" @click="linkEdit">
          <div class="float-right p-4">
            <div v-if="image">
              <img
                :src="image"
                class="h-24 w-24 rounded object-cover"
                @error="smallImageErrorHandler"
              />
            </div>
          </div>
          <div class="p-4">
            <div class="text-xl font-bold text-black text-opacity-80">
              <span>{{ menuitem.itemName }}</span>
              <span v-if="shopInfo.enableLunchDinner">
                / <LunchDinnerIcon :item="menuitem" />
              </span>
            </div>
            <div class="mt-2 text-base text-black text-opacity-80">
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
          <div class="rounded bg-black bg-opacity-5 p-2 text-xs">
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
        <o-button
          :disabled="position === 'first'"
          @click="positionUp"
          class="b-reset-tw"
        >
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-op-teal">arrow_upward</i>
          </div>
        </o-button>

        <!-- Down -->
        <o-button
          :disabled="position === 'last'"
          @click="positionDown"
          class="b-reset-tw"
        >
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-op-teal">arrow_downward</i>
          </div>
        </o-button>

        <!-- Duplicate -->
        <o-button @click="forkItem" class="b-reset-tw">
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-op-teal">queue</i>
          </div>
        </o-button>

        <!-- Delete -->
        <o-button @click="deleteItem" class="b-reset-tw">
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-red-700">delete</i>
          </div>
        </o-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { db } from "@/lib/firebase/firebase9";
import { doc, updateDoc } from "firebase/firestore";

import Price from "@/components/Price.vue";
import LunchDinnerIcon from "@/app/user/Restaurant/LunchDinnerIcon.vue";

import {
  useAdminUids,
  smallImageErrorHandler,
  useRestaurantId,
} from "@/utils/utils";

import { useStore } from "vuex";

import { useRouter } from "vue-router";
import moment from "moment-timezone";
export default defineComponent({
  components: {
    Price,
    LunchDinnerIcon,
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
  emits: ["toEditMode", "positionUp", "positionDown", "forkItem", "deleteItem"],
  setup(props, ctx) {
    const store = useStore();
    const router = useRouter();

    const restaurantId = useRestaurantId();

    const { isOwner } = useAdminUids();
    const image =
      (props.menuitem?.images?.item?.resizedImages || {})["600"] ||
      props.menuitem.itemPhoto;
    const soldOut = computed(() => {
      return !!props.menuitem.soldOut; // = !soldOut;
    });
    const soldOutToggle = (e: boolean) => {
      const path = `restaurants/${restaurantId.value}/menus/${props.menuitem.id}`;
      updateDoc(doc(db, path), { soldOut: e });
    };

    const soldOutToday = computed(() => {
      const today = moment(store.state.date).format("YYYY-MM-DD");
      return props.menuitem.soldOutToday === today; // = !soldOut;
    });
    const soldOutTodayToggle = (e: boolean) => {
      const today = moment(store.state.date).format("YYYY-MM-DD");
      const path = `restaurants/${restaurantId.value}/menus/${props.menuitem.id}`;
      if (e) {
        updateDoc(doc(db, path), { soldOutToday: today });
      } else {
        updateDoc(doc(db, path), { soldOutToday: null });
      }
    };
    const linkEdit = () => {
      if (isOwner.value) {
        router.push({
          path: `/admin/restaurants/${restaurantId.value}/menus/${props.menuitem.id}`,
        });
      }
    };

    const positionUp = () => {
      ctx.emit("positionUp", props.menuitem.id);
    };
    const positionDown = () => {
      ctx.emit("positionDown", props.menuitem.id);
    };
    const forkItem = () => {
      ctx.emit("forkItem", props.menuitem.id);
    };
    const deleteItem = () => {
      store.commit("setAlert", {
        code: "editMenu.reallyDelete",
        callback: () => {
          ctx.emit("deleteItem", props.menuitem.id);
        },
      });
    };

    return {
      isOwner,

      image,
      soldOut,
      soldOutToggle,
      soldOutToday,
      soldOutTodayToggle,
      linkEdit,

      positionUp,
      positionDown,
      forkItem,
      deleteItem,

      smallImageErrorHandler,
    };
  },
});
</script>
