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

		<!--Floating text-->
		<div class="mb-2 border-4 border-green-600 text-green-600 text-center font-bold text-sm fixed left-4 right-4 mx-auto max-w-lg items-center rounded-full bg-white p-3 shadow-lg bottom-3 z-30 sm:bottom-8"
         v-if="hasOrder === 0"
         >
      {{ $t("mobileOrder.campaign.fixedMessage3") }}
		</div>

		<!--Banner-->
    <div class="m-4 mt-6 rounded-lg bg-white sm:max-w-5xl lg:mx-auto">
      <div class="flex w-full justify-center">
        <img
          :src="moBaseUrl + '/images/assets/202306/202306_lp_mobile.png'"
          class="rounded-lg object-cover sm:hidden"
        />
				<img
          :src="moBaseUrl + '/images/assets/202306/202306_lp_tablet.png'"
          class="rounded-lg object-cover hidden sm:block"
        />
      </div>
    </div>

		<!--Overview-->
		<div class="m-4 rounded-lg bg-white sm:max-w-5xl lg:mx-auto border-2 border-[#0068B7]">
			<div class="text-center bg-[#0068B7] text-white font-bold py-1">
				{{ $t("mobileOrder.campaign.overview") }}
			</div>
			<div class="py-3 px-5">
				<div class="-ml-2 text-sm sm:text-base font-bold text-black text-opacity-40 mb-1">{{ $t("mobileOrder.campaign.part3") }}</div>
				<div class="text-sm sm:text-base font-bold">
					<div>{{ $t("mobileOrder.campaign.period3") }}</div>
					<div>{{ $t("mobileOrder.campaign.receivingPeriod3") }}</div>
				</div>
					<div class="-ml-2 mt-3 text-sm sm:text-base font-bold text-black text-opacity-40">{{ $t("mobileOrder.campaign.notes") }}</div>
					<ul class="ml-4 list-outside list-disc text-xs sm:text-sm">
						<li class="mt-2">{{ $t("mobileOrder.campaign.note11") }}</li>
						<li class="mt-2">{{ $t("mobileOrder.campaign.note12") }}</li>
						<li class="mt-2">{{ $t("mobileOrder.campaign.note13") }}</li>
					</ul>
					<div class="ml-4 text-xs sm:text-sm">
						<div class="mt-1">{{ $t("mobileOrder.campaign.note14") }}</div>
						<div class="mt-0.5">{{ $t("mobileOrder.campaign.note15") }}</div>
						<div class="mt-0.5">{{ $t("mobileOrder.campaign.note16") }}</div>
					</div>
					<ul class="ml-4 list-outside list-disc text-xs sm:text-sm">
						<li class="mt-2">{{ $t("mobileOrder.campaign.note17") }}</li>
						<li class="mt-2">{{ $t("mobileOrder.campaign.note18") }}</li>
						<li class="mt-2">{{ $t("mobileOrder.campaign.note19") }}</li>
						<li class="mt-2">{{ $t("mobileOrder.campaign.note20") }}</li>
						<li class="mt-2">{{ $t("mobileOrder.campaign.note21") }}</li>
					</ul>
			</div>
		</div>

		<!--Item 1-->
    <MoPageOneBuyOneTemplate
      :buySrc="moBaseUrl + '/images/assets/202306/20230620_1_buy.png'"
      :getSrc="moBaseUrl + '/images/assets/202306/20230620_1_get.png'"
      >
      <template v-slot:header>
      </template>
      
      <template v-slot:menu>
        <template v-for="(id, k) in ['999387', '999388']" >
          <MoPageMenu2
            :key="k"
            v-if="menuObj[getMenuId(id)]"
            :menu="menuObj[getMenuId(id)]"
            :orders="orders"
            @pushQuantities="pushQuantities"
            @pullQuantities="pullQuantities"
            :shopInfo="shopInfo"
            />
        </template>
      </template>
      <template v-slot:footer>
      </template>
    </MoPageOneBuyOneTemplate>

		<!--Item 2-->
    <MoPageOneBuyOneTemplate
      :buySrc="moBaseUrl + '/images/assets/202306/20230620_2_buy.png'"
      :getSrc="moBaseUrl + '/images/assets/202306/20230620_2_get.png'"
      >
      <template v-slot:header>
      </template>
      
      <template v-slot:menu>
        <template v-for="(id, k) in ['999389', '999390']" >
          <MoPageMenu2
            :key="k"
            v-if="menuObj[getMenuId(id)]"
            :menu="menuObj[getMenuId(id)]"
            :orders="orders"
            @pushQuantities="pushQuantities"
            @pullQuantities="pullQuantities"
            :shopInfo="shopInfo"
            />
        </template>
      </template>
      <template v-slot:footer>
      </template>
    </MoPageOneBuyOneTemplate>

		<!--Item 3-->
    <MoPageOneBuyOneTemplate
      :buySrc="moBaseUrl + '/images/assets/202306/20230620_3_buy.png'"
      :getSrc="moBaseUrl + '/images/assets/202306/20230620_3_get.png'"
      >
      <template v-slot:header>
      </template>
      
      <template v-slot:menu>
        <template v-for="(id, k) in ['999391', '999392', '999393']" >
          <MoPageMenu2
            :key="k"
            v-if="menuObj[getMenuId(id)]"
            :menu="menuObj[getMenuId(id)]"
            :orders="orders"
            @pushQuantities="pushQuantities"
            @pullQuantities="pullQuantities"
            :shopInfo="shopInfo"
            />
        </template>
      </template>
      <template v-slot:footer>
      </template>
    </MoPageOneBuyOneTemplate>

		<!--Item 4-->
    <MoPageOneBuyOneTemplate
      :buySrc="moBaseUrl + '/images/assets/202306/20230620_4_buy.png'"
      :getSrc="moBaseUrl + '/images/assets/202306/20230620_4_get.png'"
      >
      <template v-slot:header>
      </template>
      
      <template v-slot:menu>
        <MoPageMenu2
          v-if="menuObj[getMenuId('999394')]"
          :menu="menuObj[getMenuId('999394')]"
          :orders="orders"
          @pushQuantities="pushQuantities"
          @pullQuantities="pullQuantities"
          :shopInfo="shopInfo"
          />
      </template>
      <template v-slot:footer>
      </template>
    </MoPageOneBuyOneTemplate>

		<!--Item 5-->
    <MoPageOneBuyOneTemplate
      :buySrc="moBaseUrl + '/images/assets/202306/20230620_5_buy.png'"
      :getSrc="moBaseUrl + '/images/assets/202306/20230620_5_get.png'"
      >
      <template v-slot:header>
      </template>
      
      <template v-slot:menu>
        <template v-for="(id, k) in ['999395', '999396']" >
          <MoPageMenu2
            :key="k"
            v-if="menuObj[getMenuId(id)]"
            :menu="menuObj[getMenuId(id)]"
            :orders="orders"
            @pushQuantities="pushQuantities"
            @pullQuantities="pullQuantities"
            :shopInfo="shopInfo"
            />
        </template>
      </template>
      <template v-slot:footer>
      </template>
    </MoPageOneBuyOneTemplate>

		<!--Item 6-->
    <MoPageOneBuyOneTemplate
      :buySrc="moBaseUrl + '/images/assets/202306/20230620_6_buy.png'"
      :getSrc="moBaseUrl + '/images/assets/202306/20230620_6_get.png'"
      >
      <template v-slot:header>
      </template>
      
      <template v-slot:menu>
        <template v-for="(id, k) in ['999397', '999398', '999399']" >
          <MoPageMenu2
            :key="k"
            v-if="menuObj[getMenuId(id)]"
            :menu="menuObj[getMenuId(id)]"
            :orders="orders"
            @pushQuantities="pushQuantities"
            @pullQuantities="pullQuantities"
            :shopInfo="shopInfo"
            />
        </template>
      </template>
      <template v-slot:footer>
      </template>
    </MoPageOneBuyOneTemplate>

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
      "999387",
      "999388",
      "999389",
      "999390",
      "999391",
      "999392",
      "999393",
      "999394",
      "999395",
      "999396",
      "999397",
      "999398",
      "999399",
    ].map((id) => {
      return {
        id: getMenuId(id),
        offset: 30,
        count: 2,
      };
    }),
  },
];
export default moPage(setMenus);
</script>
