<template>
  <div class="columns is-gapless">
    <div class="column is-narrow w-6"></div>
    <!-- Center Column -->
    <div class="column">
      <div class="text-center">
        <router-link class="h-9 cursor-pointer rounded-full bg-black/5" to="">
          <span class="pr-4 pl-4">
            <span class="text-op-teal font-bold">{{
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
