<template>
  <div>
    <router-link :to="url">
      <div
        class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
      >
        <i class="material-icons mr-2 text-lg text-op-teal">arrow_back</i>
        <span class="text-sm font-bold text-op-teal">{{
          $t("button.back")
        }}</span>
      </div>
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    url: {
      type: String,
      required: true,
    },
  },
});
</script>
