<template>
  <div v-if="showAddLine" class="mt-6 text-center">
    <div v-if="hasLine">
      <div
        class="mx-6 rounded-lg bg-black bg-opacity-5 p-4"
        v-if="hasFriends !== null || isDev"
      >
        <button @click="handleLineAuth">
          <div
            class="inline-flex h-12 items-center justify-center rounded-full px-6"
            style="background: #18b900"
          >
            <i class="fab fa-line mr-2 text-2xl text-white" />
            <div class="text-base font-bold text-white">
              {{ $t("line.notifyMeFromFriend") }}
            </div>
          </div>
        </button>
        <div class="mt-2 text-sm">
          {{ $t("order.lineMessage") }}
        </div>
      </div>
    </div>
    <div v-else>
      <button @click="handleLineAuth">
        <div
          class="inline-flex h-12 items-center justify-center rounded-full px-6"
          style="background: #18b900"
        >
          <i class="fab fa-line mr-2 text-2xl text-white" />
          <div class="text-base font-bold text-white">
            {{ $t("line.notifyMe") }}
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "vue";
import { lineAuthURL, lineAuthRestaurantURL } from "@/lib/line/line";
import { ownPlateConfig } from "@/config/project";

import { useStore } from "vuex";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
import {
  isDev,
} from "@/utils/utils";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
    hasFriends: {
      type: Boolean,
      required: false,
    },
    hasLine: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();

    const handleLineAuth = () => {
      const url = (() => {
        if (props.hasLine) {
          return lineAuthRestaurantURL(
            "/callback/" + props.shopInfo.restaurantId + "/line",
            {
              pathname: location.pathname,
            },
            props.shopInfo.lineClientId,
          );
        } else {
          return lineAuthURL("/callback/line", {
            pathname: location.pathname,
          });
        }
      })();
      location.href = url;
    };
    const showAddLine = computed(() => {
      if (props.hasLine) {
        return !props.hasFriends;
      }
      return !!ownPlateConfig.line && !store.state.claims?.line;
    });
    return {
      handleLineAuth,
      showAddLine,
      isDev,
    };
  },
});
</script>
