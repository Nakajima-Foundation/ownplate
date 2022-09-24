<template>
  <b-modal
    :active.sync="isActive"
    :width="488"
    scroll="keep"
    @close="closeNotificationSettings"
  >
    <div class="mx-2 my-6 rounded-lg bg-white p-6 text-left shadow-lg">
      <!-- Title -->
      <div class="text-xl font-bold text-black text-opacity-40">
        {{ $t("admin.order.notification") }}
      </div>

      <!-- Body -->
      <div class="mt-6">
        <!-- Incomplete Orders -->
        <div>
          <incomplete-orders v-if="shopInfo" :shopInfo="shopInfo" />
        </div>

        <!-- Settings -->
        <div class="mt-6">
          <div class="mb-2 text-sm font-bold text-black text-opacity-60">
            {{ $t("admin.order.notificationSettings") }}
          </div>

          <!-- Sound ON/OFF -->
          <a @click="soundToggle()">
            <div
              v-if="notificationConfig.soundOn"
              class="inline-flex h-9 items-center justify-center rounded-full bg-green-600 bg-opacity-10 px-4"
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
              class="inline-flex h-9 items-center justify-center rounded-full bg-red-700 bg-opacity-10 px-4"
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
            class="mt-2 ml-4 rounded-lg border-2 border-black border-opacity-10 p-4"
          >
            <!-- Infinity Notification ON/OFF -->
            <a @click="infinityNotificationToggle()" class="inline-block">
              <div v-if="notificationConfig.infinityNotification">
                <div
                  class="mr-2 mb-2 inline-flex h-9 items-center justify-center rounded-full bg-green-600 bg-opacity-10 px-4"
                >
                  <i class="material-icons mr-2 text-lg text-green-600"
                    >repeat</i
                  >
                  <span class="text-sm font-bold text-green-600">
                    {{ $t("admin.order.infinityNotificationOn") }}
                  </span>
                </div>

                <div
                  class="mr-2 mb-2 inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
                >
                  <i
                    class="material-icons mr-2 text-lg text-black text-opacity-30"
                    >looks_one</i
                  >
                  <span class="text-sm font-bold text-black text-opacity-30">
                    {{ $t("admin.order.infinityNotificationOff") }}
                  </span>
                </div>
              </div>

              <div v-else>
                <div
                  class="mr-2 mb-2 inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
                >
                  <i
                    class="material-icons mr-2 text-lg text-black text-opacity-30"
                    >repeat</i
                  >
                  <span class="text-sm font-bold text-black text-opacity-30">
                    {{ $t("admin.order.infinityNotificationOn") }}
                  </span>
                </div>

                <div
                  class="mr-2 mb-2 inline-flex h-9 items-center justify-center rounded-full bg-green-600 bg-opacity-10 px-4"
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
              <b-select v-model="soundIndex" class="mr-2">
                <option
                  v-for="(soundFile, index) in soundFiles"
                  :value="index"
                  :key="index"
                >
                  {{ $t(soundFile.nameKey) }}
                </option>
              </b-select>

              <a
                class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
                @click="delayedSoundPlay"
              >
                <i class="material-icons mr-2 text-lg text-op-teal"
                  >play_arrow</i
                >
                <span class="text-sm font-bold text-op-teal">
                  {{ $t("admin.order.soundTest") }}
                </span>
              </a>
            </div>
          </div>

          <!-- LINE Connection -->
          <div class="mt-4">
            <router-link
              v-if="isLineEnabled"
              class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
              :to="`/admin/restaurants/${restaurantId()}/line`"
            >
              <i class="fab fa-line mr-2 text-2xl text-op-teal" />
              <span class="text-sm font-bold text-op-teal">
                {{ $t("admin.order.line") }}
              </span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-6 text-center">
        <a
          @click="closeNotificationSettings()"
          class="inline-flex h-12 items-center justify-center rounded-full bg-black bg-opacity-5 px-6"
          style="min-width: 8rem"
        >
          <div class="text-base font-bold text-black text-opacity-60">
            {{ $t("menu.close") }}
          </div>
        </a>
      </div>
    </div>
  </b-modal>
</template>

<script>
import { db, firestore } from "@/plugins/firebase";

import { soundFiles } from "@/config/constant";
import { getSoundIndex } from "@/utils/utils";

import IncompleteOrders from "@/app/admin/Notifications/IncompleteOrders.vue";

export default {
  components: {
    IncompleteOrders,
  },
  props: {
    notificationData: {
      type: Object,
      required: true,
    },
    NotificationSettingsPopup: {
      type: Boolean,
      required: true,
    },
    shopInfo: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      soundIndex: undefined,
      soundFiles: soundFiles,
      notificationConfig: {},
      isActive: false,
    };
  },
  created() {
    this.notificationConfig = this.notificationData;
    this.soundIndex = getSoundIndex(this.notificationData.nameKey);
  },
  mounted() {
    this.isActive = this.NotificationSettingsPopup;
  },
  watch: {
    NotificationSettingsPopup() {
      this.isActive = this.NotificationSettingsPopup;
    },
    async soundIndex(newData, oldData) {
      this.notificationConfig.nameKey = soundFiles[this.soundIndex].nameKey;
      // Ignore the very first change
      if (oldData !== undefined) {
        await this.saveNotificationData();
      }
    },
    async "notificationConfig.soundOn"() {
      await this.saveNotificationData();
    },
    async "notificationConfig.infinityNotification"() {
      await this.saveNotificationData();
    },
  },
  methods: {
    infinityNotificationToggle() {
      this.notificationConfig.infinityNotification =
        !this.notificationConfig.infinityNotification;
    },
    soundToggle() {
      this.notificationConfig.soundOn = !this.notificationConfig.soundOn;
    },
    async saveNotificationData() {
      this.notificationConfig.updatedAt =
        firestore.FieldValue.serverTimestamp();
      await db
        .doc(`restaurants/${this.restaurantId()}/private/notifications`)
        .set(this.notificationConfig);
    },
    closeNotificationSettings() {
      this.$emit("close");
    },
    delayedSoundPlay() {
      // We need to add a delay so that it won't interrupt the very first silent sound.
      setTimeout(() => {
        this.soundPlay();
      }, 100);
    },
  },
};
</script>
