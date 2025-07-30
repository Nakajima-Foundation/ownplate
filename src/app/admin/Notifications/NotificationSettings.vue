<template>
  <t-modal
    :active="notificationSettingsPopup"
    width="488"
    scroll="keep"
    @close="closeNotificationSettings"
  >
    <div class="mx-2 my-6 rounded-lg bg-white p-6 text-left shadow-lg">
      <!-- Title -->
      <div class="text-xl font-bold text-black/40">
        {{ $t("admin.order.notification") }}
      </div>

      <!-- Body -->
      <div class="mt-2">
        <!-- Incomplete Orders -->
        <div>
          <incomplete-orders
            v-if="shopInfo"
            :shopInfo="shopInfo"
            @close="closeNotificationSettings()"
          />
        </div>

        <!-- Settings -->
        <div class="mt-2">
          <div class="mb-2 text-sm font-bold text-black/60">
            {{ $t("admin.order.notificationSettings") }}
          </div>

          <!-- Sound ON/OFF -->
          <a @click="soundToggle()">
            <div
              v-if="notificationConfig.soundOn"
              class="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-green-600/10 px-4"
            >
              <i class="material-icons mr-2 text-lg text-green-600"
                >volume_up</i
              >
              <div class="text-sm font-bold text-green-600">
                {{ $t("admin.order.soundOn") }}
              </div>
            </div>

            <div
              v-else
              class="inline-flex h-9 items-center justify-center rounded-full bg-red-700/10 px-4"
            >
              <i class="material-icons mr-2 text-lg text-red-700">volume_off</i>
              <div class="text-sm font-bold text-red-700">
                {{ $t("admin.order.soundOff") }}
              </div>
            </div>
          </a>

          <!-- Sound ON Settings -->
          <div
            v-if="notificationConfig.soundOn"
            class="mt-2 ml-4 rounded-lg border-2 border-black/10 p-4"
          >
            <!-- Infinity Notification ON/OFF -->
            <a @click="infinityNotificationToggle()" class="inline-block">
              <div v-if="notificationConfig.infinityNotification">
                <div
                  class="mr-2 mb-2 inline-flex h-9 items-center justify-center rounded-full bg-green-600/10 px-4"
                >
                  <i class="material-icons mr-2 text-lg text-green-600"
                    >repeat</i
                  >
                  <span class="text-sm font-bold text-green-600">
                    {{ $t("admin.order.infinityNotificationOn") }}
                  </span>
                </div>

                <div
                  class="mr-2 mb-2 inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
                >
                  <i class="material-icons mr-2 text-lg text-black/30"
                    >looks_one</i
                  >
                  <span class="text-sm font-bold text-black/30">
                    {{ $t("admin.order.infinityNotificationOff") }}
                  </span>
                </div>
              </div>

              <div v-else>
                <div
                  class="mr-2 mb-2 inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
                >
                  <i class="material-icons mr-2 text-lg text-black/30"
                    >repeat</i
                  >
                  <span class="text-sm font-bold text-black/30">
                    {{ $t("admin.order.infinityNotificationOn") }}
                  </span>
                </div>

                <div
                  class="mr-2 mb-2 inline-flex h-9 items-center justify-center rounded-full bg-green-600/10 px-4"
                >
                  <i class="material-icons mr-2 text-lg text-green-600"
                    >looks_one</i
                  >
                  <span class="text-sm font-bold text-green-600">
                    {{ $t("admin.order.infinityNotificationOff") }}
                  </span>
                </div>
              </div>
            </a>

            <!-- Sound Type and Test -->
            <div class="mt-2 flex items-center">
              <o-select v-model="soundIndex" class="mr-2">
                <option
                  v-for="(soundFile, index) in soundFiles"
                  :value="index"
                  :key="index"
                >
                  {{ $t(soundFile.nameKey) }}
                </option>
              </o-select>

              <a
                class="inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
                @click="delayedSoundPlay"
              >
                <i class="material-icons text-op-teal mr-2 text-lg"
                  >play_arrow</i
                >
                <span class="text-op-teal text-sm font-bold">
                  {{ $t("admin.order.soundTest") }}
                </span>
              </a>
            </div>
          </div>

          <!-- LINE Connection -->
          <div class="mt-4" @click="closeNotificationSettings()">
            <router-link
              v-if="isLineEnabled"
              class="inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
              :to="`/admin/restaurants/${restaurantId}/line`"
            >
              <i class="fab fa-line text-op-teal mr-2 text-2xl" />
              <span class="text-op-teal text-sm font-bold">
                {{ $t("admin.order.line") }}
              </span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-4 text-center">
        <a
          @click="closeNotificationSettings()"
          class="inline-flex h-12 items-center justify-center rounded-full bg-black/5 px-6"
          style="min-width: 8rem"
        >
          <div class="text-base font-bold text-black/60">
            {{ $t("menu.close") }}
          </div>
        </a>
      </div>
    </div>
  </t-modal>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { db } from "@/lib/firebase/firebase9";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { soundFiles } from "@/config/constant";
import {
  getSoundIndex,
  useRestaurantId,
  useSoundPlay,
  isLineEnabled,
} from "@/utils/utils";

import IncompleteOrders from "@/app/admin/Notifications/IncompleteOrders.vue";

export default defineComponent({
  components: {
    IncompleteOrders,
  },
  props: {
    notificationData: {
      type: Object,
      required: true,
    },
    notificationSettingsPopup: {
      type: Boolean,
      required: true,
    },
    shopInfo: {
      type: Object,
      required: false,
    },
  },
  emits: ["close"],
  setup(props, ctx) {
    const notificationConfig = ref(props.notificationData);
    const soundIndex = ref(getSoundIndex(props.notificationData.nameKey));
    const restaurantId = useRestaurantId();
    const saveNotificationData = () => {
      notificationConfig.value.updatedAt = serverTimestamp();
      setDoc(
        doc(db, `restaurants/${restaurantId.value}/private/notifications`),
        notificationConfig.value,
      );
    };
    watch(soundIndex, (newData, oldData) => {
      notificationConfig.value.nameKey = soundFiles[soundIndex.value].nameKey;
      // Ignore the very first change
      if (oldData !== undefined) {
        saveNotificationData();
      }
    });
    const infinityNotificationToggle = () => {
      notificationConfig.value.infinityNotification =
        !notificationConfig.value.infinityNotification;
      saveNotificationData();
    };
    const soundToggle = () => {
      notificationConfig.value.soundOn = !notificationConfig.value.soundOn;
      saveNotificationData();
    };
    const closeNotificationSettings = () => {
      ctx.emit("close");
    };
    const soundPlay = useSoundPlay();
    const delayedSoundPlay = () => {
      // We need to add a delay so that it won't interrupt the very first silent sound.
      setTimeout(() => {
        soundPlay();
      }, 100);
    };
    return {
      soundIndex,
      soundFiles,
      notificationConfig,

      infinityNotificationToggle,
      soundToggle,
      closeNotificationSettings,
      delayedSoundPlay,
      isLineEnabled,

      restaurantId,
    };
  },
});
</script>
