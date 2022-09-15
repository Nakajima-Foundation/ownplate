<template>
  <div
    v-if="isFlash"
    @click="dismissBanner()"
    class="bg-blue-500 fixed z-50 w-full h-16 flex justify-center items-center animate-pulse"
  >
    <i class="material-icons text-white text-2xl">notifications_active</i>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from "@vue/composition-api";
export default defineComponent({
  setup(props, ctx) {
    const isFlash = ref(false);

    const flash = () => {
      isFlash.value = true;
      setTimeout(() => {
        isFlash.value = false;
      }, 5000);
    };

    const dismissBanner = () => {
      isFlash.value = false;
    };

    const event = computed(() => {
      return ctx.root.$store.state.orderEvent;
    });
    watch(event, () => {
      flash();
    });

    return {
      isFlash,
      dismissBanner,
    };
  },
});
</script>
