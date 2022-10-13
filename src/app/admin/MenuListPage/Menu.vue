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
            <b-checkbox
              :value="soldOut"
              @input="soldOutToggle"
              :disabled="disabledEdit"
            >
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
              {{ menuitem.itemName }}
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
      v-if="isOwner && !isInMo"
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
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-op-teal">arrow_upward</i>
          </div>
        </b-button>
        <b-button v-else disabled class="b-reset-tw">
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
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
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-op-teal">arrow_downward</i>
          </div>
        </b-button>
        <b-button v-else disabled class="b-reset-tw">
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-op-teal">arrow_downward</i>
          </div>
        </b-button>

        <!-- Duplicate -->
        <b-button @click="forkItem" class="b-reset-tw">
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-op-teal">queue</i>
          </div>
        </b-button>

        <!-- Delete -->
        <b-button @click="deleteItem" class="b-reset-tw">
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-red-700">delete</i>
          </div>
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from "@vue/composition-api";
import { db } from "@/plugins/firebase";
import Price from "@/components/Price";
import { useAdminUids, smallImageErrorHandler } from "@/utils/utils";

export default defineComponent({
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
    isInMo: {
      type: Boolean,
      required: true,
    },
    groupData: {
      type: Object,
      required: false,
    },
  },
  emit: ["toEditMode", "positionUp", "positionDown", "forkItem", "deleteItem"],
  setup(props, ctx) {
    const { isOwner } = useAdminUids(ctx);
    const image =
      (props.menuitem?.images?.item?.resizedImages || {})["600"] ||
      props.menuitem.itemPhoto;
    const soldOut = computed(() => {
      return !!props.menuitem.soldOut; // = !soldOut;
    });
    const soldOutToggle = (e) => {
      const path = `restaurants/${ctx.root.restaurantId()}/menus/${
        props.menuitem.id
      }`;
      db.doc(path).update("soldOut", e);
    };
    const disabledEdit = computed(() => {
      return (
        props.isInMo &&
        props.groupData?.restaurantId !== ctx.root.restaurantId()
      );
    });
    const linkEdit = () => {
      if (isOwner.value && !disabledEdit.value) {
        ctx.root.$router.push({
          path: `/admin/restaurants/${ctx.root.restaurantId()}/menus/${
            props.menuitem.id
          }`,
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
      ctx.root.$store.commit("setAlert", {
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
      disabledEdit,
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
