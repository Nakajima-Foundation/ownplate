<template>
  <div>
    <!-- {{pageId}} -->
    <MoPage202303
      v-if="pageId == '202303'"
      :pageId="pageId"
      :pageBase="pageBase"
      />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
} from "@vue/composition-api";

import MoPage202303 from "./MoPage202303.vue";

export default defineComponent({
  components: {
    MoPage202303,
  },
  props: {
    pageId: {
      type: String,
      required: true,
    },
    pageBase: {
      type: String,
      required: true,
    },
  },
  //setup(props, ctx) {
  // }
});
</script>
    
