<template>
  <!-- Smaregi -->
  <div class="mt-6">
    <div class="mb-2 text-xl font-bold text-black text-opacity-40">
      {{ $t("admin.thirdPartyService.title") }}
    </div>

    <div class="rounded-lg bg-white p-4 shadow">
      <div class="text-center">
        <router-link
          to="/admin/smaregi/index"
          class="inline-flex h-12 items-center rounded-full border-2 border-op-teal px-6"
        >
          <span class="text-base font-bold text-op-teal">{{
            $t("admin.thirdPartyService.openSmaregi")
          }}</span>
        </router-link>
      </div>

      <div class="mt-4 text-center">
        <a
          href="https://docs.omochikaeri.com/manuals/smaregi.pdf"
          target="_blank"
          class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
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
          class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
        >
          <span class="text-sm font-bold text-op-teal">
            {{ $t("admin.thirdPartyService.smaregiAppMarket") }}
          </span>
        </a>
      </div>
    </div>
  </div>
</template>
