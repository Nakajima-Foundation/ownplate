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
      :shopInfo="shopInfo"
      :isPickup="isPickup"
      />
    <MoPage20230302
      v-if="pageId == '20230302'"
      :pageId="pageId"
      :pageBase="pageBase"
      :groupData="groupData"
      @didOrderdChange="didOrderdChange"
      :orders="orders"
      :selectedOptions="selectedOptions"
      :shopInfo="shopInfo"
      :isPickup="isPickup"
      />
    <MoPage202303Spring
      v-if="pageId == '202303spring'"
      :pageId="pageId"
      :pageBase="pageBase"
      :groupData="groupData"
      @didOrderdChange="didOrderdChange"
      :orders="orders"
      :selectedOptions="selectedOptions"
      :shopInfo="shopInfo"
      :isPickup="isPickup"

      :howtoreceive="howtoreceive"
      @input="updateHowtoreceive"
      :disabledPickupTime="disabledPickupTime"
      :noAvailableTime="noAvailableTime"
      :lastOrder="lastOrder"
      :moPickupSuspend="moPickupSuspend"

      />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
} from "@vue/composition-api";

import MoPage202303 from "./MoPage202303.vue";
import MoPage20230302 from "./MoPage20230302.vue";
import MoPage202303Spring from "./MoPage202303Spring.vue";

export default defineComponent({
  components: {
    MoPage202303,
    MoPage20230302,
    MoPage202303Spring,
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
    shopInfo: {
      type: Object,
      required: true,
    },
    isPickup: {
      type: Boolean,
      required: true,
    },

    howtoreceive: {
      type: String,
      required: true,
    },
      disabledPickupTime: {
        type: Boolean,
        required: true,
      },
      noAvailableTime: {
        type: Boolean,
        required: false,
      },
      lastOrder: {
        type: String,
        required: false,
      },
      moPickupSuspend: {
        type: Boolean,
        required: false,
      },

  },
  setup(props, ctx) {
    const didOrderdChange = (param: any) => {
      ctx.emit("didOrderdChange", param)
    }
    const updateHowtoreceive = (value: string) => {
      ctx.emit("input", value);
    };
    return {
      didOrderdChange,
      updateHowtoreceive,
    };
  }
});
</script>
    
