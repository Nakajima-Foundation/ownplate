<template>
  <div class="columns is-gapless">
    <div class="column is-narrow w-6"></div>
    <!-- Center Column -->
    <div class="column">
      <div class="text-center">
        <router-link
          class="cursor-pointer h-9 rounded-full bg-black/5"
          to=""
        >
          <span class="pl-4 pr-4">
            <span class="font-bold text-op-teal">{{
              $t("lp.moreDetails")
            }}</span>
          </span>
        </router-link>
      </div>
    </div>
    <div class="column is-narrow w-6"></div>
  </div>
</template>
<script lang="ts">
export default {};
</script>
