<template>
  <div class="w-full fixed h-screen top-0 bg-black bg-opacity-20">
    <div class="w-full h-1/2" @click="closeCart"></div>
    <div class="w-full h-1/2 bg-white fixed z-10 overflow-x-scroll">
      <div>
        店名<br />
        店名<br />
        店名<br />
        店名<br />
        店名<br />
        店名<br />
        店名<br />
        店名<br />
        店名<br />
        店名<br />
        店名<br />
        店名<br />
        店名<br />
        店名<br />
        店名<br />
        店名<br />
        店名<br />
        メニュー ボタン
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";
export default defineComponent({
  emits: ["closeCart"],
  setup(props, ctx) {
    return {
      closeCart: () => {
        ctx.emit("closeCart");
      },
    };
  },
});
</script>
