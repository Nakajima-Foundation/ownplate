<template>
  <div>
    {{menu.itemName}}<br/>1セットに{{mData.count}}入/
    <img :src="smallimage"
         @error="smallImageErrorHandler"
         class="w-8"
         /> /
    <button @click="pushQuantities(mData.id, 1)">add</button>
    /<button @click="pullQuantities(mData.id, 1)">remove</button>
    / {{ (orders[mData.id]||{})[0] || 0 }}
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
} from "@vue/composition-api";

import {
  smallImageErrorHandler,
} from "@/utils/utils";

export default defineComponent({
  props: {
    menu: {
      type: Object,
      required: true,
    },
    mData: {
      type: Object,
      required: true,
    },
    orders: {
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
    return {
      pushQuantities: (id:string, num: number) => {
        ctx.emit("pushQuantities", id, num);
      },
      pullQuantities: (id:string, num: number) => {
        ctx.emit("pullQuantities", id, num);
      },
      addSet: (id: string) => {
        ctx.emit("addSet", id);
      },
      smallImageErrorHandler,
      smallimage,
      image,
    }
  },
});
</script>
