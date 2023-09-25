<template>
  <div>
    <SideMenu ref="sideMenu" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import SideMenu from "@/components/App/SideMenu.vue";

export default defineComponent({
  components: {
    SideMenu,
  },
  setup() {
    const sideMenu = ref();

    const handleOpen = () => {
      sideMenu.value.handleOpen();
    };
    return {
      sideMenu,

      handleOpen,
    };
  },
});
</script>
