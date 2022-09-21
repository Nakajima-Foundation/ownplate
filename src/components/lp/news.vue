<template>
  <div class="mx-6 mt-6 text-center">
    <div class="bg-white rounded-lg p-6 mt-4 lg:mt-0">
      <router-link to="/news">
        <div
          class="h-12 rounded-full bg-op-teal inline-flex items-center px-8 shadow hover:bg-opacity-30"
        >
          <span class="text-white text-base font-bold">
            {{ $t("lp.whatsnew") }}</span
          >
        </div>
      </router-link>
    </div>
  </div>
</template>
