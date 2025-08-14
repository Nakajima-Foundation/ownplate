<template>
  <div>
    <router-link :to="url">
      <div
        class="inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
      >
        <i class="material-icons text-op-teal mr-2 text-lg"
          >{{ iconText ? iconText : "home" }}
        </i>
        <span class="text-op-teal text-sm font-bold">{{
          $t(backText ? backText : "button.adminTop")
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
    iconText: {
      type: String,
      required: false,
    },
    backText: {
      type: String,
      required: false,
    },
  },
});
</script>
