<template>
  <div class="fixed top-0 z-20 h-full w-full bg-white">
    <div class="h-screen overflow-y-scroll bg-[#F7F8FB]">
      <MoPage202305 :moBasePath="moBasePath" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
} from "@vue/composition-api";

import MoPage202305 from "./MoPage202305.vue";
export default defineComponent({
  props: {
    moBasePath: {
      type: String,
      required: true,
    },
  },
  components: {
    MoPage202305,
  }
});

</script>

