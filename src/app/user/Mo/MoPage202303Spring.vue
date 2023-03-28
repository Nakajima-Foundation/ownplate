<template>
  <div class="h-screen overflow-y-scroll">
    <!-- Mo Pickup Toggle -->
    <div class="mx-6 mt-3 mb-2 sm:max-w-5xl lg:mx-auto">
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

    <div class="m-4 mt-6 rounded-lg bg-[#FF82A0] sm:max-w-5xl lg:mx-auto">
      <div class="flex w-full justify-center">
        <img
          :src="moBaseUrl + '/images/assets/setcampaign-hero-image_mobile.png'"
          class="rounded-lg object-cover sm:hidden"
        />
        <img
          :src="moBaseUrl + '/images/assets/setcampaign-hero-image_tablet.png'"
          class="hidden rounded-lg object-cover sm:block"
        />
      </div>
      <div class="mx-6 mb-8 pb-6">
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
                :shopInfo="shopInfo"
              />
              <hr />
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="m-4 mt-6 mb-28 sm:max-w-5xl lg:mx-auto">
      <router-link
        :to="`${pageBase}/categories/${isPickup ? 'pickup' : 'takeout'}`"
        ><div
          class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
        >
          <i class="material-icons text-op-teal">list</i>
          <span class="ml-1 text-sm font-bold text-op-teal">
            {{ $t("shopInfo.productCategory") }}
          </span>
        </div></router-link
      >
    </div>
  </div>
</template>

<script lang="ts">
import { moPage, getMenuId } from "./MoPageCommon";

const setMenus = [
  {
    id: "",
    setName: "",
    menus: [
      {
        id: getMenuId("9999999"),
        offset: 100,
        count: 2,
      },
      {
        id: getMenuId("9999998"),
        offset: 100,
        count: 3,
      },
      {
        id: getMenuId("9999997"),
        offset: 100,
        count: 1,
      },
    ],
  },
];
export default moPage(setMenus);
</script>
