<template>
  <div>
    <SideMenuMo ref="sideMenu" v-if="isInMo" />
    <SideMenu ref="sideMenu" v-else />
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";

import { useIsInMo } from "@/utils/utils";

import SideMenu from "@/components/App/SideMenu.vue";
import SideMenuMo from "@/components/App/SideMenuMo.vue";

export default defineComponent({
  components: {
    SideMenu,
    SideMenuMo,
  },
  setup() {
    const sideMenu = ref();

    const isInMo = useIsInMo();

    const handleOpen = () => {
      sideMenu.value.handleOpen();
    };
    return {
      sideMenu,

      isInMo,
      handleOpen,
    };
  },
});
</script>
