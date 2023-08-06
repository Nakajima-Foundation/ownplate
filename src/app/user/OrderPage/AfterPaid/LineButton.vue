<template>
  <div v-if="showAddLine" class="mt-6 text-center">
    <o-button @click="handleLineAuth" class="b-reset-tw">
      <div
        class="inline-flex h-12 items-center justify-center rounded-full px-6"
        style="background: #18b900"
      >
        <i class="fab fa-line mr-2 text-2xl text-white" />
        <div class="text-base font-bold text-white">
          <span v-if="hasLine">
            {{ $t("line.notifyMeFromFriend") }}
          </span>
          <span v-else>
            {{ $t("line.notifyMe") }}
          </span>
        </div>
      </div>
    </o-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, PropType } from "vue";
import { lineAuthURL, lineAuthRestaurantURL } from "@/lib/line/line";
import { lineVerifyFriend } from "@/lib/firebase/functions";
import { ownPlateConfig } from "@/config/project";

import { useStore } from "vuex";
import { RestaurantInfoData } from "@/models/RestaurantInfo";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    
    const hasLine = computed(() => {
      return props.shopInfo.hasLine && props.shopInfo.lineClientId;
    });

    const hasFriends = ref<boolean | undefined>(undefined);
    watch(hasLine, async () => {
      const ret = await lineVerifyFriend({restaurantId: props.shopInfo.restaurantId});
      hasFriends.value = ret.data.result;
    }, { immediate: true });
    
    const handleLineAuth = () => {
      const url = (() => {
        if (hasLine) {
          return lineAuthRestaurantURL(
            "/callback/" + props.shopInfo.restaurantId + "/line", {
              pathname: location.pathname,
            },
            props.shopInfo.lineClientId,
          );
        } else {
          return lineAuthURL("/callback/line", {
            pathname: location.pathname,
          });
        }
      })()
      location.href = url;
    };
    const showAddLine = computed(() => {
      if (hasLine.value) {
        return  hasFriends.value;
      }
      return !!ownPlateConfig.line && !store.state.claims?.line;
    });
    return {
      handleLineAuth,
      showAddLine,
      hasLine,
    };
  },
});
</script>
