<template>
  <div>
    <span v-if="isSet"
      >{{ menu.itemName }}<br />1セットに{{ mData.count }}入/</span
    >
    <div class="mx-auto mb-4 max-w-md rounded-lg bg-white p-5 shadow">
      <img
        :src="resizedImage"
        @error="smallImageErrorHandler"
        class="mx-auto flex h-40 w-40 justify-center rounded-lg object-cover sm:h-72 sm:w-72"
      />
      <div class="mt-6 text-left text-xl font-bold text-black">
        {{ menu.itemName }}
      </div>

      <!-- Description -->
      <div class="mt-3 text-sm">{{ menu.itemDescription }}</div>

      <div class="mt-3 inline-flex items-end">
        <div class="text-base font-bold text-red-600">
          <Price :shopInfo="shopInfo" :menu="menu" />
        </div>
        <div class="ml-2 mb-0.5 text-xs text-black line-through">
          <Price :shopInfo="shopInfo" :menu="menu" :offset="mData.offset || 0" />
        </div>
      </div>

      <div class="mt-3 flex items-center">
        <button
          @click="pullQuantities(mData.id, 1)"
          :id="mData.id"
          class="itemRemove inline-flex h-9 w-24 items-center justify-center rounded-full bg-red-700 bg-opacity-10"
        >
          <i class="material-icons text-lg text-red-700">remove</i>
        </button>

        <div class="flex-1 text-center text-3xl text-op-teal">
          {{ (orders[mData.id] || {})[0] || 0 }}
        </div>

        <button
          @click="pushQuantities(mData.id, 1)"
          :id="mData.id"
          class="itemAdd inline-flex h-9 w-24 items-center justify-center rounded-full bg-op-teal bg-opacity-10"
        >
          <i class="material-icons text-lg text-op-teal">add</i>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";

import Price from "@/components/Price.vue";
import { smallImageErrorHandler } from "@/utils/utils";

export default defineComponent({
  components: {
    Price,
  },
  props: {
    menu: {
      type: Object,
      required: true,
    },
    mData: {
      type: Object,
      required: true,
    },
    isSet: {
      type: Boolean,
      required: true,
    },
    orders: {
      type: Object,
      required: true,
    },
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  setup(props, ctx) {
    const image = computed(() => {
      return (
        (props.menu?.images?.item?.resizedImages || {})["600"] ||
        props.menu.itemPhoto
      );
    });
    const smallimage = computed(() => {
      return (
        (props.menu?.images?.item?.resizedImages || {})["100"] ||
        (props.menu?.images?.item?.resizedImages || {})["600"] ||
        props.menu.itemPhoto
      );
    });
    const resizedImage = computed(() => {
      return (
        (props.menu?.images?.item?.resizedImages || {})["600"] ||
        props.menu.itemPhoto
      );
    });
    return {
      pushQuantities: (id: string, num: number) => {
        ctx.emit("pushQuantities", id, num);
      },
      pullQuantities: (id: string, num: number) => {
        ctx.emit("pullQuantities", id, num);
      },
      addSet: (id: string) => {
        ctx.emit("addSet", id);
      },
      smallImageErrorHandler,
      smallimage,
      resizedImage,
      image,
    };
  },
});
</script>
