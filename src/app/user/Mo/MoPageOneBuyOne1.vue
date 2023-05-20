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
      {{ $t("mobileOrder.campaign.fixedMessage1") }}
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
				{{ $t("mobileOrder.campaign.part1") }}
			</div>
			<div class="text-black py-3 font-bold px-5">
				<div class="text-sm sm:text-base text-center">{{ $t("mobileOrder.campaign.period1") }}</div>
				<div class="text-sm sm:text-base text-center">{{ $t("mobileOrder.campaign.receivingPeriod1") }}</div>
				<div class="sm:w-11/12 md:w-8/12 mx-auto">
				<div class="mt-2 text-xs text-black text-opacity-40">{{ $t("mobileOrder.campaign.note11") }}</div>
				<div class="mt-1 text-xs text-black text-opacity-40">{{ $t("mobileOrder.campaign.note12") }}</div>
				</div>
			</div>
		</div>

		<!--Item 1-->
    <div class="mx-4 mb-4 rounded-lg bg-[#DBF5FE] sm:max-w-5xl lg:mx-auto">
      <MoPageOneBuyOneTemplate
        :buySrc="moBaseUrl + '/images/assets/202306/20230606_1_buy.png'"
        :getSrc="moBaseUrl + '/images/assets/202306/20230606_1_get.png'"
        >
        <template v-slot:header>
        </template>

        <template v-slot:menu>
					<div class="mx-2 grid grid-cols-3 content-start gap-2">
            <MoPageMenu2
              v-if="menuObj[getMenuId('999184')]"
              :menu="menuObj[getMenuId('999184')]"
              :orders="orders"
              @pushQuantities="pushQuantities"
              @pullQuantities="pullQuantities"
              :shopInfo="shopInfo"
              />
            <MoPageMenu2
              v-if="menuObj[getMenuId('999185')]"
              :menu="menuObj[getMenuId('999185')]"
              :orders="orders"
              @pushQuantities="pushQuantities"
              @pullQuantities="pullQuantities"
              :shopInfo="shopInfo"
              />
            <MoPageMenu2
              v-if="menuObj[getMenuId('999186')]"
              :menu="menuObj[getMenuId('999186')]"
              :orders="orders"
              @pushQuantities="pushQuantities"
              @pullQuantities="pullQuantities"
              :shopInfo="shopInfo"
              />
					</div>
        </template>
        <template v-slot:footer>
        </template>
      </MoPageOneBuyOneTemplate>
    </div>

		<!--Item 2-->
    <div class="mx-4 mb-4 rounded-lg bg-[#DBF5FE] sm:max-w-5xl lg:mx-auto">
      <MoPageOneBuyOneTemplate
        :buySrc="moBaseUrl + '/images/assets/202306/20230606_2_buy.png'"
        :getSrc="moBaseUrl + '/images/assets/202306/20230606_2_get.png'"
        >
        <template v-slot:header>
        </template>

        <template v-slot:menu>
					<div class="mx-2 grid grid-cols-3 content-start gap-2">
            <MoPageMenu2
              v-if="menuObj[getMenuId('999187')]"
              :menu="menuObj[getMenuId('999187')]"
              :orders="orders"
              @pushQuantities="pushQuantities"
              @pullQuantities="pullQuantities"
              :shopInfo="shopInfo"
              />
            <MoPageMenu2
              v-if="menuObj[getMenuId('999188')]"
              :menu="menuObj[getMenuId('999188')]"
              :orders="orders"
              @pushQuantities="pushQuantities"
              @pullQuantities="pullQuantities"
              :shopInfo="shopInfo"
              />
            <MoPageMenu2
              v-if="menuObj[getMenuId('999189')]"
              :menu="menuObj[getMenuId('999189')]"
              :orders="orders"
              @pushQuantities="pushQuantities"
              @pullQuantities="pullQuantities"
              :shopInfo="shopInfo"
              />
					</div>
        </template>
        <template v-slot:footer>
        </template>
      </MoPageOneBuyOneTemplate>
    </div>

		<!--Item 3-->
    <div class="mx-4 mb-4 rounded-lg bg-[#DBF5FE] sm:max-w-5xl lg:mx-auto">
      <MoPageOneBuyOneTemplate
        :buySrc="moBaseUrl + '/images/assets/202306/20230606_3_buy.png'"
        :getSrc="moBaseUrl + '/images/assets/202306/20230606_3_get.png'"
        >
        <template v-slot:header>
        </template>

        <template v-slot:menu>
					<div class="mx-2 grid grid-cols-3 content-start gap-2">
            <MoPageMenu2
              v-if="menuObj[getMenuId('999190')]"
              :menu="menuObj[getMenuId('999190')]"
              :orders="orders"
              @pushQuantities="pushQuantities"
              @pullQuantities="pullQuantities"
              :shopInfo="shopInfo"
              />
            <MoPageMenu2
              v-if="menuObj[getMenuId('999191')]"
              :menu="menuObj[getMenuId('999191')]"
              :orders="orders"
              @pushQuantities="pushQuantities"
              @pullQuantities="pullQuantities"
              :shopInfo="shopInfo"
              />
					</div>
        </template>
        <template v-slot:footer>
        </template>
      </MoPageOneBuyOneTemplate>
    </div>

		<!--Item 4-->
    <div class="mx-4 mb-4 rounded-lg bg-[#DBF5FE] sm:max-w-5xl lg:mx-auto">
      <MoPageOneBuyOneTemplate
        :buySrc="moBaseUrl + '/images/assets/202306/20230606_4_buy.png'"
        :getSrc="moBaseUrl + '/images/assets/202306/20230606_4_get.png'"
        >
        <template v-slot:header>
        </template>

        <template v-slot:menu>
					<div class="mx-2 grid grid-cols-3 content-start gap-2">
            <MoPageMenu2
              v-if="menuObj[getMenuId('999192')]"
              :menu="menuObj[getMenuId('999192')]"
              :orders="orders"
              @pushQuantities="pushQuantities"
              @pullQuantities="pullQuantities"
              :shopInfo="shopInfo"
              />
            <MoPageMenu2
              v-if="menuObj[getMenuId('999193')]"
              :menu="menuObj[getMenuId('999193')]"
              :orders="orders"
              @pushQuantities="pushQuantities"
              @pullQuantities="pullQuantities"
              :shopInfo="shopInfo"
              />
					</div>
        </template>
        <template v-slot:footer>
        </template>
      </MoPageOneBuyOneTemplate>
    </div>

		<!--Item 5-->
    <div class="mx-4 mb-4 rounded-lg bg-[#DBF5FE] sm:max-w-5xl lg:mx-auto">
      <MoPageOneBuyOneTemplate
        :buySrc="moBaseUrl + '/images/assets/202306/20230606_5_buy.png'"
        :getSrc="moBaseUrl + '/images/assets/202306/20230606_5_get.png'"
        >
        <template v-slot:header>
        </template>

        <template v-slot:menu>
					<div class="mx-2 grid grid-cols-3 content-start gap-2">
            <MoPageMenu2
              v-if="menuObj[getMenuId('999194')]"
              :menu="menuObj[getMenuId('999194')]"
              :orders="orders"
              @pushQuantities="pushQuantities"
              @pullQuantities="pullQuantities"
              :shopInfo="shopInfo"
              />
            <MoPageMenu2
              v-if="menuObj[getMenuId('999195')]"
              :menu="menuObj[getMenuId('999195')]"
              :orders="orders"
              @pushQuantities="pushQuantities"
              @pullQuantities="pullQuantities"
              :shopInfo="shopInfo"
              />
					</div>
        </template>
        <template v-slot:footer>
        </template>
      </MoPageOneBuyOneTemplate>
    </div>

		<!--Item 6-->
    <div class="mx-4 mb-4 rounded-lg bg-[#DBF5FE] sm:max-w-5xl lg:mx-auto">
      <MoPageOneBuyOneTemplate
        :buySrc="moBaseUrl + '/images/assets/202306/20230606_6_buy.png'"
        :getSrc="moBaseUrl + '/images/assets/202306/20230606_6_get.png'"
        >
        <template v-slot:header>
        </template>

        <template v-slot:menu>
					<div class="mx-2 grid grid-cols-3 content-start gap-2">
            <MoPageMenu2
              v-if="menuObj[getMenuId('999196')]"
              :menu="menuObj[getMenuId('999196')]"
              :orders="orders"
              @pushQuantities="pushQuantities"
              @pullQuantities="pullQuantities"
              :shopInfo="shopInfo"
              />
					</div>
        </template>
        <template v-slot:footer>
        </template>
      </MoPageOneBuyOneTemplate>
    </div>

		<!--Item 7-->
    <div class="mx-4 mb-4 rounded-lg bg-[#DBF5FE] sm:max-w-5xl lg:mx-auto">
      <MoPageOneBuyOneTemplate
        :buySrc="moBaseUrl + '/images/assets/202306/20230606_7_buy.png'"
        :getSrc="moBaseUrl + '/images/assets/202306/20230606_7_get.png'"
        >
        <template v-slot:header>
        </template>

        <template v-slot:menu>
					<div class="mx-2 grid grid-cols-3 content-start gap-2">
            <MoPageMenu2
              v-if="menuObj[getMenuId('999197')]"
              :menu="menuObj[getMenuId('999197')]"
              :orders="orders"
              @pushQuantities="pushQuantities"
              @pullQuantities="pullQuantities"
              :shopInfo="shopInfo"
              />
					</div>
        </template>
        <template v-slot:footer>
        </template>
      </MoPageOneBuyOneTemplate>
    </div>

		<!--Item 8-->
    <div class="mx-4 mb-4 rounded-lg bg-[#DBF5FE] sm:max-w-5xl lg:mx-auto">
      <MoPageOneBuyOneTemplate
        :buySrc="moBaseUrl + '/images/assets/202306/20230606_8_buy.png'"
        :getSrc="moBaseUrl + '/images/assets/202306/20230606_8_get.png'"
        >
        <template v-slot:header>
        </template>

        <template v-slot:menu>
					<div class="mx-2 grid grid-cols-3 content-start gap-2">
            <MoPageMenu2
              v-if="menuObj[getMenuId('999198')]"
              :menu="menuObj[getMenuId('999198')]"
              :orders="orders"
              @pushQuantities="pushQuantities"
              @pullQuantities="pullQuantities"
              :shopInfo="shopInfo"
              />
            <MoPageMenu2
              v-if="menuObj[getMenuId('999199')]"
              :menu="menuObj[getMenuId('999199')]"
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
          :src="moBaseUrl + '/images/assets/202306/20230606_8_get.png'"
          class="rounded-lg object-cover"
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
      "999184",
      "999185",
      "999186",
      "999187",
      "999188",
      "999189",
      
      "999190",
      "999191",
      
      "999192",
      "999193",
      
      "999194",
      "999195",
      
      "999196",
      
      "999197",

      "999198",
      "999199",
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
