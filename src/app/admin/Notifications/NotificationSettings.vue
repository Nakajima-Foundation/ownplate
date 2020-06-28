<template>
  <b-modal :active.sync="isActive" :width="488" scroll="keep" @close="closeNotificationSettings">
    <div class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
      <!-- Title -->
      <div class="t-h6 c-text-black-disabled">{{ $t("admin.order.notification") }}</div>
      <!-- Body -->
      <div>
        <!-- Incomplete Orders -->
        <incomplete-orders v-if="shopInfo" :shopInfo="shopInfo" />
        <!-- Settings -->
        <div>
          <div
            class="t-subtitle2 c-text-black-medium p-b-8 m-t-24"
          >{{ $t("admin.order.notificationSettings") }}</div>
          <!-- Sound ON/OFF -->
          <div @click="soundToggle()" class="is-inline-block m-r-16">
            <div v-if="notificationConfig.soundOn" class="op-button-pill bg-status-green-bg">
              <i class="material-icons c-status-green s-18">volume_up</i>
              <span class="c-status-green t-button">
                {{
                $t("admin.order.soundOn")
                }}
              </span>
            </div>
            <div v-else class="op-button-pill bg-status-red-bg">
              <i class="material-icons c-status-red s-18">volume_off</i>
              <span class="c-status-red t-button">
                {{
                $t("admin.order.soundOff")
                }}
              </span>
            </div>
          </div>

          <!-- Sound ON Settings -->
          <div
            v-if="notificationConfig.soundOn"
            class="m-l-16 p-l-16 p-t-8 m-t-8"
            style="border-left: 2px solid rgba(0,0,0,0.1); "
          >
            <!-- Infinity Notification ON/OFF -->
            <div @click="infinityNotificationToggle()" class="is-inline-block">
              <div
                v-if="notificationConfig.infinityNotification"
                class="op-button-pill bg-status-green-bg"
              >
                <i class="material-icons c-status-green s-18">repeat</i>
                <span class="c-status-green t-button">
                  {{
                  $t("admin.order.infinityNotificationOn")
                  }}
                </span>
              </div>
              <div v-else class="op-button-pill bg-status-green-bg">
                <i class="material-icons c-status-green s-18">looks_one</i>
                <span class="c-status-green t-button">
                  {{
                  $t("admin.order.infinityNotificationOff")
                  }}
                </span>
              </div>
            </div>

            <!-- Sound Type and Test -->
            <div class="cols flex-center m-t-16">
              <!-- Sound Type -->
              <b-select v-model="soundIndex" class="m-r-16">
                <option
                  v-for="(soundFile, index) in soundFiles"
                  :value="index"
                  :key="index"
                >{{ $t(soundFile.nameKey) }}</option>
              </b-select>

              <!-- Sound Test -->
              <b-button class="b-reset op-button-pill bg-form" @click="delayedSoundPlay">
                <i class="material-icons c-primary s-18 m-l-8">play_arrow</i>
                <span class="c-primary t-button">
                  {{
                  $t("admin.order.soundTest")
                  }}
                </span>
              </b-button>
            </div>
          </div>

          <!-- LINE Connection -->
          <div class="m-t-24">
            <router-link
              v-if="isLineEnabled"
              class="op-button-pill bg-status-green-bg"
              :to="`/admin/restaurants/${restaurantId()}/line`"
            >
              <i class="fab fa-line c-status-green" style="font-size:24px" />
              <span class="c-status-green t-button">
                {{
                $t("admin.order.line")
                }}
              </span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="m-t-24 align-center">
        <div
          class="op-button-small tertiary"
          @click="closeNotificationSettings()"
        >{{ $t("menu.close") }}</div>
      </div>
    </div>
  </b-modal>
</template>

<script>
import { db, firestore } from "~/plugins/firebase.js";
import { soundFiles } from "~/plugins/constant.js";

import IncompleteOrders from "./IncompleteOrders";

export default {
  components: {
    IncompleteOrders
  },
  props: {
    notificationData: {
      type: Object,
      required: true
    },
    NotificationSettingsPopup: {
      type: Boolean,
      required: true
    },
    shopInfo: {
      type: Object,
      required: false
    }
  },
  data() {
    return {
      soundIndex: undefined,
      soundFiles: soundFiles,
      notificationConfig: {},
      isActive: false
    };
  },
  created() {
    this.notificationConfig = this.notificationData;
    this.soundIndex = this.getSoundIndex(this.notificationData.nameKey);
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
    }
  },
  methods: {
    infinityNotificationToggle() {
      this.notificationConfig.infinityNotification = !this.notificationConfig
        .infinityNotification;
    },
    soundToggle() {
      this.notificationConfig.soundOn = !this.notificationConfig.soundOn;
    },
    async saveNotificationData() {
      this.notificationConfig.updatedAt = firestore.FieldValue.serverTimestamp();
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
    }
  }
};
</script>
