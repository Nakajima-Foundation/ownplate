<template>
  <div class="h-screen overflow-y-scroll bg-white">
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
      </div>
    </div>
    <div>
      <div class="mx-6 mb-8 pb-6">
        <MoPageOneBuyOneTemplate>
          <template v-slot:header>
            チキン、唐揚げ
          </template>
          <template v-slot:menu>
            <MoPageMenu2
              v-if="menuObj['b2287c39e8faa8ff6abee7e23e9a330e3326ad6f']"
              :menu="menuObj['b2287c39e8faa8ff6abee7e23e9a330e3326ad6f']"
              :orders="orders"
              @pushQuantities="pushQuantities"
              @pullQuantities="pullQuantities"
              :shopInfo="shopInfo"
              />
            <MoPageMenu2
              v-if="menuObj['c51d14bfcb35d8160c149a5e25eac2813b6d06b9']"
              :menu="menuObj['c51d14bfcb35d8160c149a5e25eac2813b6d06b9']"
              :orders="orders"
              @pushQuantities="pushQuantities"
              @pullQuantities="pullQuantities"
              :shopInfo="shopInfo"
              />
          </template>
          <template v-slot:footer>
            コーヒー
          </template>
        </MoPageOneBuyOneTemplate>
      </div>
    </div>

    <div>
      <div class="mx-6 mb-8 pb-6">
        <MoPageOneBuyOneTemplate>
          <template v-slot:header>
            焼き鳥
          </template>
          <template v-slot:menu>
            <MoPageMenu2
              v-if="menuObj['00a1518fb7e27f95f87daf6e03f04bda36093606']"
              :menu="menuObj['00a1518fb7e27f95f87daf6e03f04bda36093606']"
              :orders="orders"
              @pushQuantities="pushQuantities"
              @pullQuantities="pullQuantities"
              :shopInfo="shopInfo"
              />
            <MoPageMenu2
              v-if="menuObj['883994b1b3f5f57c24fe2e8abf7d7e22467f61ad']"
              :menu="menuObj['883994b1b3f5f57c24fe2e8abf7d7e22467f61ad']"
              :orders="orders"
              @pushQuantities="pushQuantities"
              @pullQuantities="pullQuantities"
              :shopInfo="shopInfo"
              />
          </template>
          <template v-slot:footer>
            コーヒー
          </template>
        </MoPageOneBuyOneTemplate>
      </div>
    </div>

    
    <div class="m-4 mt-6 pb-40 sm:max-w-5xl lg:mx-auto">
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
    id: "buy",
    setName: "",
    menus: [
      {
        // id: getMenuId("9999999"),
        id :"00a1518fb7e27f95f87daf6e03f04bda36093606",
        offset: 100,
        count: 2,
      },
      {
        // id: getMenuId("9999999"),
        id :"883994b1b3f5f57c24fe2e8abf7d7e22467f61ad",
        offset: 100,
        count: 2,
      },
      {
        // id: getMenuId("9999999"),
        id :"b2287c39e8faa8ff6abee7e23e9a330e3326ad6f",
        offset: 100,
        count: 2,
      },
      {
        // id: getMenuId("9999999"),
        id :"c51d14bfcb35d8160c149a5e25eac2813b6d06b9",
        offset: 100,
        count: 2,
      },
      
      
    ],
  },
];
export default moPage(setMenus);
</script>
