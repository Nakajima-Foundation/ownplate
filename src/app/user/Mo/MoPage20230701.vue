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

		<!--Banner-->
    <div class="m-4 mt-6 rounded-lg bg-white sm:max-w-5xl lg:mx-auto">
      <div class="flex w-full justify-center">
        <img
          :src="moBaseUrl + '/images/assets/202307/202307_lp_mobile.png'"
          class="rounded-lg object-cover sm:hidden"
        />
				<img
          :src="moBaseUrl + '/images/assets/202307/202307_lp_tablet.png'"
          class="rounded-lg object-cover hidden sm:block"
        />
      </div>
    </div>

		<!--Overview-->
		<div class="m-4 rounded-lg bg-white sm:max-w-5xl lg:mx-auto border-2 border-[#D3BC4A]">
			<div class="text-center bg-[#D3BC4A] text-white font-bold py-1">
				{{ $t("mobileOrder.campaign.overview") }}
			</div>
			<div class="py-4 px-5">
				<div class="text-sm sm:text-base">
					<div>{{ $t("mobileOrder.campaign.overviewJuly1") }}</div>
					<div class="mt-2">{{ $t("mobileOrder.campaign.overviewJuly2") }}</div>
					<ul class="mt-2 ml-4 list-outside list-disc">
						<li class="mt-0.5">{{ $t("mobileOrder.campaign.overviewJuly3") }}</li>
						<li class="mt-0.5">{{ $t("mobileOrder.campaign.overviewJuly4") }}</li>
					</ul>
					<div class="mt-2">{{ $t("mobileOrder.campaign.overviewJuly5") }}</div>
				</div>
				<div class="-ml-2 mt-4 text-sm sm:text-base font-bold text-black text-opacity-40 mb-1">{{ $t("mobileOrder.campaign.part1") }}</div>
				<div class="text-sm sm:text-base font-bold">
					<div>{{ $t("mobileOrder.campaign.periodJuly") }}</div>
				</div>
					<div class="-ml-2 mt-4 text-sm sm:text-base font-bold text-black text-opacity-40">{{ $t("mobileOrder.campaign.notes") }}</div>
					<ul class="ml-4 list-outside list-disc text-xs sm:text-sm">
						<li class="mt-2">{{ $t("mobileOrder.campaign.note22") }}</li>
						<li class="mt-2">{{ $t("mobileOrder.campaign.note23") }}</li>
						<li class="mt-2">{{ $t("mobileOrder.campaign.note24") }}</li>
					</ul>
			</div>
		</div>

		<div class="mx-6">
        <div v-for="(menu, k) in setMenus" :key="k">
          <div v-for="(m, j) in menu.menus" :key="j">
            <template v-if="menuObj[m.id]">
              <MoPageMenu
                :menu="menuObj[m.id]"
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
      "999978",
      "999979",
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
