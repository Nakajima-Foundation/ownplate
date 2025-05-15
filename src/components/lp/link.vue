<template>
  <div class="mt-2 bg-ownplate-yellow p-4">
    <div
      class="m-auto inline-flex w-full items-center justify-center text-center"
    >
      <!-- Facebook User Group -->
      <div class="inline-block px-1 pb-2" v-if="false">
        <a
          href="https://www.facebook.com/groups/278028420106364/"
          target="_blank"
        >
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-white bg-opacity-80 px-4"
          >
            <i class="fab fa-facebook mr-2 text-lg text-op-teal"></i>
            <span class="text-sm font-bold text-op-teal">{{
              $t("admin.facebookUserGroup")
            }}</span>
          </div>
        </a>
      </div>

      <!-- X -->
      <div class="inline-block px-1 pb-2">
        <a href="https://x.com/omochikaericom" target="_blank">
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-white bg-opacity-80 px-4 hover:bg-opacity-100"
          >
            <i class="fab fa-x-twitter mr-2 text-lg text-op-teal"></i>
            <span class="text-sm font-bold text-op-teal">(Twitter)</span>
          </div>
        </a>
      </div>

      <!-- Note -->
      <div class="inline-block px-1 pb-2">
        <a href="https://note.com/singsoc/m/m19dd935e84e4" target="_blank">
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-white bg-opacity-80 px-4 hover:bg-opacity-100"
          >
            <span class="text-sm font-bold text-op-teal">Note</span>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
export default {};
</script>
