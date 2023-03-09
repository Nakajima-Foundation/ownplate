<template>
  <div>
    <div>
      2023-03 春のキャンペーン
    </div>

    <div v-for="(menu, k) in setMenus" :key="k">
      <div v-for="(m, j) in menu.menus" :key="j">
        <template v-if="menuObj[m.id]">
          <MoPageMenu
            :isSet="false"
            :menu="menuObj[m.id]"
            :mData="m"
            :orders="orders"
            @pushQuantities="pushQuantities"
            @pullQuantities="pullQuantities"
            />
          <hr />
        </template>
      </div>
    </div>

    <div>
      <router-link
        :to="pageBase"
        >BACK
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import {
  moPage
} from "./MoPageCommon";

import MoPageMenu from "./MoPageMenu.vue";

const setMenus = [{
  menus: [{
    id: "68dc4c052eb0b02bdd34258fbd21b86e46b44437",
    count: 2,
  }, {
    id: "58b5197d27a96743a6405c5029fbce6d721d3beb",
    count: 3,
  },
          {
    id: "9a714af83e3aee2d5b779d9de5b9eb9c4361847d",
    count: 1,
    }
          
         ],
}];
export default moPage(setMenus);

</script>
