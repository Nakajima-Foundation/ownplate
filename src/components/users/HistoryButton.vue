<template>
  <div class="mt-6 text-center">
    <router-link to="/u/history">
      <div
        class="inline-flex justify-center items-center h-16 rounded-full bg-op-teal shadow"
        style="min-width: 16rem"
      >
        <i class="material-icons text-2xl text-white mr-2">history</i>
        <div class="text-xl font-bold text-white">
          {{ $t("order.history") }}
        </div>
      </div>
    </router-link>
  </div>
</template>
