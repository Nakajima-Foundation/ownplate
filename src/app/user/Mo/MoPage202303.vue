<template>
  <div>
    <div>
    2023-03
    </div>
    <div v-for="(menu, k) in setMenus" :key="k">
      {{menu.setName}}
      <div v-for="(m, j) in menu.menus" :key="j">
        <template v-if="menuObj[m.id]">
          {{menuObj[m.id].itemName}}<br/>1セットに{{m.count}}入/

          <button @click="pushQuantities(m.id, 1)">add</button>
          /<button @click="pullQuantities(m.id, 1)">remove</button>
          / {{ (orders[m.id]||{})[0] || 0 }}
          <hr />
        </template>
      </div>
      <div>
        <button @click="addSet(menu.id)">セット追加</button>
      </div>
    </div>
    <div>
    </div>
    <hr/>
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

const setMenus = [{
  id: "setMenu1",
  setName: "123",
  menus: [{
    id: "16fc6cc015fac4d3494570fa791ee64f28e18932",
    count: 1,
  }, {
    id: "68d085d49cb8e3429816dbcfd773c07007216322",
    count: 2,
  },{
    id: "f848011904c7dca7b8494c62cc34622874e27ade",
    count: 3,
  }
         ],
}];
export default moPage(setMenus);

</script>
