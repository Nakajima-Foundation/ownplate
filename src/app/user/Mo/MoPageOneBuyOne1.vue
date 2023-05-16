<template>
  <div class="h-screen overflow-y-scroll bg-[#F7F8FB]">
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

		<!--ToDo フローティング案内文をカートボタンがない時のみ表示させる-->
		<div class="mb-2 border-4 border-green-600 text-green-600 text-center font-bold text-sm fixed left-4 right-4 mx-auto max-w-lg items-center rounded-full bg-white p-3 shadow-lg bottom-3 z-30 sm:bottom-8">
      {{ $t("mobileOrder.campaign.fixedMessage1") }}
		</div>

    <div class="m-4 mt-6 rounded-lg bg-white sm:max-w-5xl lg:mx-auto">
      <div class="flex w-full justify-center">
        <img
          :src="moBaseUrl + '/images/assets/setcampaign-hero-image_mobile.png'"
          class="rounded-lg object-cover sm:hidden"
        />
				<img
          :src="moBaseUrl + '/images/assets/setcampaign-hero-image_tablet.png'"
          class="rounded-lg object-cover hidden sm:block"
        />
      </div>
    </div>

		<div class="m-4 mt-6 rounded-lg bg-white sm:max-w-5xl lg:mx-auto border-2 border-[#0068B7]">
			<div class="text-center bg-[#0068B7] text-white font-bold py-1">
				{{ $t("mobileOrder.campaign.part1") }}
			</div>
			<div class="text-black py-3 font-bold px-5 ">
				<div class="text-sm text-center">{{ $t("mobileOrder.campaign.period1") }}</div>
				<div class="text-sm text-center">{{ $t("mobileOrder.campaign.receivingPeriod1") }}</div>
				<div class="mt-2 text-xs text-black text-opacity-40">{{ $t("mobileOrder.campaign.note11") }}</div>
				<div class="mt-2 text-xs text-black text-opacity-40">{{ $t("mobileOrder.campaign.note12") }}</div>
			</div>
		</div>

    <div class="mx-4 mb-4 rounded-lg pb-6 bg-[#DBF5FE] sm:max-w-5xl lg:mx-auto">
      <MoPageOneBuyOneTemplate>
        <template v-slot:header>
				<div class="flex w-full justify-center mb-3 sm:mb-6">
          <img
          :src="moBaseUrl + '/images/assets/campaign_202305_mobile.png'"
          class="rounded-lg object-cover sm:hidden"
        />
        <img
          :src="moBaseUrl + '/images/assets/campaign_202305_tablet.png'"
          class="rounded-lg object-cover hidden sm:block"
        />
				</div>
          </template>

          <template v-slot:menu>
					<div class="mx-2 grid grid-cols-3 content-start gap-2">
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
					</div>
          </template>
          <template v-slot:footer>
          <div class="flex w-full justify-center mt-3 sm:mt-6">
          	<img
          	:src="moBaseUrl + '/images/assets/campaign_202305_mobile.png'"
          	class="rounded-lg object-cover sm:hidden"
        		/>
        		<img
          	:src="moBaseUrl + '/images/assets/campaign_202305_tablet.png'"
          	class="rounded-lg object-cover hidden sm:block"
        		/>
				</div>
        </template>
      </MoPageOneBuyOneTemplate>
    </div>

    <div class="mx-4 mb-4 rounded-lg pb-6 bg-[#DBF5FE] sm:max-w-5xl lg:mx-auto">
      <MoPageOneBuyOneTemplate>
        <template v-slot:header>
          <div class="flex w-full justify-center mb-3 sm:mb-6">
          <img
          :src="moBaseUrl + '/images/assets/campaign_202305_mobile.png'"
          class="rounded-lg object-cover sm:hidden"
        />
        <img
          :src="moBaseUrl + '/images/assets/campaign_202305_tablet.png'"
          class="rounded-lg object-cover hidden sm:block"
        />
				</div>
          </template>

          <template v-slot:menu>
					<div class="mx-2 grid grid-cols-3 content-start gap-2">
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
					</div>
          </template>
          <template v-slot:footer>
             <div class="flex w-full justify-center mt-3 sm:mt-6">
          	<img
          	:src="moBaseUrl + '/images/assets/campaign_202305_mobile.png'"
          	class="rounded-lg object-cover sm:hidden"
        		/>
        		<img
          	:src="moBaseUrl + '/images/assets/campaign_202305_tablet.png'"
          	class="rounded-lg object-cover hidden sm:block"
        		/>
				</div>
        </template>
      </MoPageOneBuyOneTemplate>
    </div>

		<div class="mx-5 mt-4 text-xs font-bold text-black text-opacity-40 sm:max-w-5xl lg:mx-auto">
        {{ $t("mobileOrder.fixedFormat") }}
    </div>
    
    <div class="mx-5 mt-8 pb-40 sm:max-w-5xl lg:mx-auto">
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
