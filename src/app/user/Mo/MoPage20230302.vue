<template>
  <div class="h-screen overflow-y-scroll">

    <!-- Mo Pickup Toggle -->
    <div class="m-4 mt-6 sm:max-w-7xl xl:mx-auto">
      <div>
        <MoPickUp
          :shopInfo="shopInfo"
          :value="howtoreceive"
          @input="updateHowtoreceive"
          :orders="orders"
          :disabledPickupTime="disabledPickupTime"
          :noAvailableTime="noAvailableTime"
          :lastOrder="lastOrder"
          :moPickupSuspend="moPickupSuspend"
          />
      </div>
    </div>
    
    <div class="m-4 mt-6 rounded-lg bg-red-300 p-6 sm:max-w-7xl xl:mx-auto">
      hello
    </div>
    <div class="m-4 mt-6">
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
        :shopInfo="shopInfo"
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
