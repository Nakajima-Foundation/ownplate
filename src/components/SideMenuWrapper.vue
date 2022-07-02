<template>
<div>
  <SideMenuMo ref="sideMenu" v-if="isInMo" />
  <SideMenu ref="sideMenu" v-else />
</div>
</template>

<script>
import {
  defineComponent,
  ref,
} from "@vue/composition-api";

import {
  useIsInMo
} from "@/utils/utils";

import SideMenu from "@/components/SideMenu";
import SideMenuMo from "@/components/SideMenuMo";

export default defineComponent({
  components: {
    SideMenu,
    SideMenuMo
  },
  setup(_, ctx) {
    const sideMenu = ref();

    const isInMo =  useIsInMo(ctx.root);

    const handleOpen = () => {
      sideMenu.value.handleOpen();
    };
    return {
      sideMenu,

      isInMo,
      handleOpen,
    }
    
  },
})

</script>
