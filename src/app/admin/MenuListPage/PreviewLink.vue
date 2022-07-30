<template>
  <div class="flex-shrink-0">
    <router-link :to="'/r/' + restaurantId()">
      <div
        class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
      >
        <i class="material-icons text-lg text-op-teal mr-2">launch</i>
        <span class="text-sm font-bold text-op-teal">{{
          $t("admin.viewPage")
        }}</span>
      </div>
    </router-link>
  </div>
</template>
