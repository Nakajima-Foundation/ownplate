<template>
    <div class="w-full rounded-lg bg-white shadow">
      <img
        :src="resizedImage"
        @error="smallImageErrorHandler"
        class="w-full rounded-t-lg bg-white object-cover pb-3"
      />

		<div class="px-2 sm:px-3 pb-1 sm:pb-2">
      <div class="h-14 text-sm tracking-tight text-black line-clamp-3 sm:h-[72px] sm:text-base">
        {{ menu.itemName }}
      </div>
      
      <div class="mt-4 inline-flex items-end">
        <div class="w-14 sm:w-auto text-sm font-bold leading-none text-red-600">
          <Price :shopInfo="shopInfo" :menu="menu" />
        </div>
        <div class="w-9 sm:w-auto ml-0.5 sm:ml-2 text-xs text-black line-through leading-none">
          <Price :shopInfo="shopInfo" :menu="menu" :offset="menu.offset || 0" />
        </div>
      </div>

      <div class="mt-1 -mr-1 sm:mt-2 flex justify-end">
        <div class="mr-auto flex h-9 items-center text-xs font-bold leading-none text-black sm:text-sm">
          {{ $t("mobileOrder.inStock") }}
        </div>
        <button
          @click="pushQuantities(menu.id, 1)"
          :id="menu.id"
          class="itemAdd inline-flex h-9 w-9 items-center justify-center rounded-full bg-op-teal bg-opacity-10"
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
