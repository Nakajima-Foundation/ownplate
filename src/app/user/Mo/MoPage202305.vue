<template>
  <div class="fixed top-0 z-20 h-full w-full bg-white">
    <div class="h-screen overflow-y-scroll bg-[#F7F8FB]">

	<div class="mx-6 mt-6 lg:mx-auto lg:max-w-2xl">
    <div class="mt-2 rounded-lg bg-white px-6 py-5 shadow">
      <!-- Title -->
      <div class="mx-0 flex justify-center">
        <img
          :src="moBaseUrl + '/images/assets/campaign_202305_mobile.png'"
          class="sm:hidden"
        />
        <img
          :src="moBaseUrl + '/images/assets/campaign_202305_tablet.png'"
          class="hidden sm:block"
        />
      </div>

      <!-- Lead -->
      <div class="mt-4 text-base font-bold leading-relaxed">
        {{ $t("mobileOrder.campaign.lead") }}
      </div>
    </div>

    <!-- Overview -->
    <div class="mt-6 text-xl font-bold text-black text-opacity-30">
      {{ $t("mobileOrder.campaign.overview") }}
    </div>

    <div class="mt-2 rounded-lg bg-white px-6 py-5 shadow">
      <div class="mb-4 items-center">
        <div
          class="-ml-2 inline-block rounded bg-blue-50 px-2 py-1 text-sm font-bold"
        >
          {{ $t("mobileOrder.campaign.using") }}
        </div>
        <div class="mt-2 text-sm font-bold">
          {{ $t("mobileOrder.campaign.usingPeriod") }}
        </div>
				 <div class="mt-3 text-xs">
          {{ $t("mobileOrder.campaign.descriptionNote1") }}
        </div>
      </div>

      <div class="mt-3">
        <div
          class="-ml-2 inline-block rounded bg-blue-50 px-2 py-1 text-sm font-bold"
        >
          {{ $t("mobileOrder.campaign.about") }}
        </div>
        <div class="mt-2 text-base leading-relaxed">
          {{ $t("mobileOrder.campaign.description1") }}
        </div>
				<div class="mt-2 text-base leading-relaxed">
          {{ $t("mobileOrder.campaign.description2") }}
        </div>
				<div class="text-base leading-relaxed">
          {{ $t("mobileOrder.campaign.description3") }}
        </div>
        <div class="mt-3 text-xs">
          {{ $t("mobileOrder.campaign.descriptionNote2") }}
        </div>
      </div>
    </div>

    <!-- Notes -->
    <div class="mt-6 text-base font-bold text-black text-opacity-30">
      {{ $t("mobileOrder.campaign.notes") }}
    </div>

    <div class="mt-2 rounded-lg bg-white px-6 py-4 shadow">
      <ul class="ml-3 list-outside list-disc text-sm">
        <li>{{ $t("mobileOrder.campaign.note1") }}</li>
        <li class="mt-2">{{ $t("mobileOrder.campaign.note2") }}</li>
        <li class="mt-2">{{ $t("mobileOrder.campaign.note3") }}</li>
        <li class="mt-2">{{ $t("mobileOrder.campaign.note4") }}</li>
        <li class="mt-2">{{ $t("mobileOrder.campaign.note5") }}</li>
        <li class="mt-2">{{ $t("mobileOrder.campaign.note6") }}</li>
      </ul>
    </div>

		<div class="mt-8 pb-40">
			<!--ToDo サイトトップ(店舗一覧)から遷移した場合は以下の「店舗一覧」ボタンを表示-->
      <div
          class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
        >
          <i class="material-icons text-op-teal">list</i>
          <span class="ml-1 text-sm font-bold text-op-teal">
            {{ $t("shopInfo.productCategory") }}
          </span>
        </div>

			<!--ToDo 店舗トップから遷移した場合は以下の「商品カテゴリ一覧」ボタンを表示-->
      <div
          class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
        >
          <i class="material-icons text-op-teal">store</i>
          <span class="ml-1 text-sm font-bold text-op-teal">
            {{ $t("mobileOrder.restaurantLists") }}
          </span>
        </div>
    </div>
  </div>

    </div>
  </div>
</template>

