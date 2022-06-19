<template>
  <!-- Smaregi -->
  <div class="mt-6">
    <div class="text-xl font-bold text-black text-opacity-40 mb-2">
      {{ $t("admin.thirdPartyService.title") }}
    </div>

    <div class="bg-white shadow rounded-lg p-4">
      <div class="text-center mt-2">
        <router-link
          to="/admin/smaregi/index"
          class="h-12 rounded-full inline-flex items-center px-6 border-2 border-op-teal"
        >
          <span class="text-op-teal text-base font-bold">{{
            $t("admin.thirdPartyService.openSmaregi")
          }}</span>
        </router-link>
      </div>

      <div class="mt-4 text-center">
        <a
          href="https://docs.omochikaeri.com/manuals/smaregi.pdf"
          target="_blank"
          class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
        >
          <span class="text-sm font-bold text-op-teal">
            {{ $t("admin.thirdPartyService.smaregiManualLink") }}</span
          >
        </a>
      </div>

      <div class="mt-4 text-center">
        <a
          href="https://apps.smaregi.jp/apps/762"
          target="_blank"
          class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
        >
          <span class="text-sm font-bold text-op-teal">
            {{ $t("admin.thirdPartyService.smaregiAppMarket") }}
          </span>
        </a>
      </div>
    </div>
  </div>
</template>
