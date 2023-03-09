<template>
  <div>
    <!-- for test -->
    <div>
    2023-03
    </div>
    <MoPageSet
      :setMenus="setMenus"
      :menuObj="menuObj"
      :orders="orders"
      @pushQuantities="pushQuantities"
      @pullQuantities="pullQuantities"
      @addSet="addSet"
      />
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
  setName: "メニュー１セット",
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
