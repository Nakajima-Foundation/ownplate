<template>
  <div
    v-if="isFlash"
    @click="dismissBanner()"
    class="fixed z-50 flex h-16 w-full animate-pulse items-center justify-center bg-blue-500"
  >
    <i class="material-icons text-2xl text-white">notifications_active</i>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from "vue";
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
