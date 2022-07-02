<template>
  <div class="flex items-center h-12 bg-white">
    <div class="w-12">
      <a
        @click="handleOpen()"
        class="w-12 h-12 inline-flex justify-center items-center"
        >
        <i class="material-icons text-black opacity-50 text-2xl">menu</i>
      </a>
    </div>
    <div class="flex-1 text-center">
      <router-link :to="top_path">
        <img :class="this.logoClass" class="m-auto" :src="`/${this.logo}`" />
      </router-link>
    </div>
    <div class="w-12"></div>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  computed,
} from "@vue/composition-api";
import { useIsInLiff, useLiffBasePath, regionalSetting } from "@/utils/utils";

export default defineComponent({
  emits: ["handleOpen"],
  setup(_, ctx) {
    const specialLogo = {
      "5OInKqrhlpe7LHYNYXuU": {
        class: "h-8",
        image: "kuuya-logo.jpg",
      },
    };

    const inLiff  = useIsInLiff(ctx.root);
    const liff_base_path = useLiffBasePath(ctx);
    
    const top_path = computed(() => {
      // /liff/hoge or /
      return inLiff.value ? liff_base_path.value : "/";
    });
    const restaurant = computed(() => {
      return ctx.root.$route.params.restaurantId;
    });

    const logoClass = computed(() => {
      if (restaurant.value && specialLogo[restaurant.value]) {
        return specialLogo[restaurant.value].class;
      }
      return "h-6";
    });
    const logo = computed(() => {
      if (restaurant.value && specialLogo[restaurant.value]) {
        return specialLogo[restaurant.value].image;
      } else {
        return regionalSetting.Logo;
      }
    });

    const handleOpen = () => {
      ctx.emit("handleOpen");
    };
    return {
      top_path,
      logo,
      logoClass,
      handleOpen,
    };
  }
});
</script>
