<template>
  <div class="h-screen overflow-y-scroll">
    <!-- Mo Pickup Toggle -->
    <div class="mx-6 mt-3 mb-2 sm:max-w-7xl xl:mx-auto">
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

    <div class="m-4 mt-6 rounded-lg bg-[#FF82A0] sm:max-w-7xl xl:mx-auto">
      <div class="w-full rounded-lg">
        <img
          src="https://mo-data-dev.omochikaeri.com/images/assets/setcampaign-hero-image_mobile.png"
          class="object-cover sm:hidden"
        />
        <img
          src="https://mo-data-dev.omochikaeri.com/images/assets/setcampaign-hero-image_tablet.png"
          class="hidden object-cover sm:block"
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

    <div class="m-4 mt-6 mb-12 sm:max-w-7xl xl:mx-auto">
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
import { moPage } from "./MoPageCommon";

const setMenus = [
  {
    id: "",
    setName: "",
    menus: [
      {
        id: "a2868abfe17326f758af04671379e79294c7fa27",
        offset: 100,
        count: 2,
      },
      {
        id: "a50cf5774de264bbed07fffc905e5c5eed1f5229",
        offset: 100,
        count: 3,
      },
      {
        id: "b211daf0cff08cd3e2b8b789cc941ed889116317",
        offset: 100,
        count: 1,
      },
    ],
  },
];
export default moPage(setMenus);
</script>
