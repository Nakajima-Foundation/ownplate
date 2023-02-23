<template>
  <div>
    <!-- {{pageId}} -->
    <MoPage202303
      v-if="pageId == '202303'"
      :pageId="pageId"
      :pageBase="pageBase"
      :groupData="groupData"
      @didOrderdChange="didOrderdChange"
      :orders="orders"
      :selectedOptions="selectedOptions"
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
    groupData: {
      type: Object,
      required: false,
    },
    orders: {
      type: Object,
      required: true,
    },
    selectedOptions: {
      type: Object,
      required: true,
    },
  },
  setup(props, ctx) {
    const didOrderdChange = (param: any) => {
      ctx.emit("didOrderdChange", param)
    }
    return {
      didOrderdChange,
    };
  }
});
</script>
    
