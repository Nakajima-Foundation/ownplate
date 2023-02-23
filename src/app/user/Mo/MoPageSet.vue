<template>
  <div>
    <div v-for="(menu, k) in setMenus" :key="k">
      {{menu.setName}}
      <div v-for="(m, j) in menu.menus" :key="j">
        <template v-if="menuObj[m.id]">
          <MoPageMenu
            :menu="menuObj[m.id]"
            :mData="m"
            :orders="orders"
            @pushQuantities="pushQuantities"
            @pullQuantities="pullQuantities"
            />
          <hr />
        </template>
      </div>
      <div>
        <button @click="addSet(menu.id)">セット追加</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
} from "@vue/composition-api";

import MoPageMenu from "./MoPageMenu.vue";

export default defineComponent({
  components: {
    MoPageMenu
  },
  props: {
    setMenus: {
      type: Array,
      required: true,
    },
    menuObj: {
      type: Object,
      required: true,
    },
    orders: {
      type: Object,
      required: true,
    },
  },
  setup(_, ctx) {
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
    }
  },
});
</script>
