<template>
  <div class="mt-6 text-center">
    <router-link to="/u/address">
      <div
        class="inline-flex h-16 items-center justify-center rounded-full bg-op-teal shadow"
        style="min-width: 16rem"
      >
        <i class="material-icons mr-2 text-2xl text-white">home</i>
        <div class="text-xl font-bold text-white">
          {{ $t("profile.address") }}
        </div>
      </div>
    </router-link>
  </div>
</template>
