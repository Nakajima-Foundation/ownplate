<template>
  <div class="mx-6 mt-2 text-center">
    <div class="mt-4 rounded-lg bg-white p-6 lg:mt-0">
      <router-link to="/news">
        <div
          class="inline-flex h-12 items-center rounded-full bg-op-teal px-8 shadow-sm hover:bg-opacity-30"
        >
          <span class="text-base font-bold text-white">
            {{ $t("lp.whatsnew") }}</span
          >
        </div>
      </router-link>
    </div>
  </div>
</template>
