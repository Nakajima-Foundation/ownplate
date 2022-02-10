<template>
<div class="mt-6 text-center">
  <router-link to="/r/favorites">
    <div
      class="inline-flex justify-center items-center h-16 rounded-full bg-op-teal shadow"
      style="min-width: 16rem;"
      >
      <i class="material-icons text-2xl text-white mr-2">favorite</i>
      <div class="text-xl font-bold text-white">
        {{ $t("find.likes") }}
      </div>
    </div>
  </router-link>
</div>
</template>
