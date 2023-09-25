<template>
  <div>
    <a
      class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-3"
      @click="openNotificationSettings()"
    >
      <i class="material-icons text-lg text-op-teal xs:mr-1">notifications</i>
      <div
        class="invisible -mr-2 text-sm font-bold text-op-teal xs:visible xs:mr-2"
      >
        {{ $t("admin.order.notification") }}
      </div>

      <div class="mr-1 font-bold text-red-700">{{ orderCounter }}</div>

      <div
        v-if="notificationData.soundOn"
        class="mt-1 inline-flex items-center justify-center space-x-1"
      >
        <div>
          <i class="material-icons -mr-1 text-lg text-green-600">volume_up</i>
        </div>
        <div>
          <div v-if="notificationData.infinityNotification">
            <i class="material-icons text-lg text-green-600">repeat</i>
          </div>
          <div v-else>
            <i class="material-icons text-lg text-green-600">looks_one</i>
          </div>
        </div>
      </div>
      <div v-else>
        <i class="material-icons text-lg text-red-700">volume_off</i>
      </div>
    </a>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";

import { useStore } from "vuex";

export default defineComponent({
  props: {
    notificationData: Object,
  },
  setup(_, ctx) {
    const store = useStore();

    const openNotificationSettings = () => {
      ctx.emit("openNotificationSettings");
    };
    const orderCounter = computed(() => {
      return Object.keys(store.state.orderObj).reduce((tmp, key) => {
        const count = (store.state.orderObj[key] || []).length;
        return tmp + count;
      }, 0);
    });
    return {
      openNotificationSettings,
      orderCounter,
    };
  },
});
</script>
