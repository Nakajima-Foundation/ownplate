<template>
  <div>
    <div v-if="partner.length > 0" class="mt-3 mx-6 items-center">
      <div v-for="(part, k) in partner" :key="k" class="flex">
        <div class="flex-1">
          <img :src="`/partners/${part.logo}`" class="w-12" />
          <span class="font-bold">
            {{ part.name }}
          </span>
        </div>
        <div class="text-right font-bold" v-if="part.ask">
          <a href="#" @click="openContact()">サポート問い合わせ</a>
        </div>
      </div>
    </div>
    <!-- Notification Settings Popup-->
    <notification-settings
      :notificationData="notificationConfig"
      :NotificationSettingsPopup="NotificationSettingsPopup"
      @close="closeNotificationSettings"
      v-if="NotificationSettingsPopup"
    />
    <router-view></router-view>
    <notification-watcher />
    <sound-config-watcher :notificationConfig="notificationConfig" />
    <new-order-watcher :notificationConfig="notificationConfig" />
    <b-modal :active.sync="isOpen" :width="488">
      <PartnersContact :id="(partner[0] || {}).id" />
    </b-modal>
  </div>
</template>

<script>
import { db, firestore } from "@/plugins/firebase";
import NotificationWatcher from "./Watcher/NotificationWatcher";
import SoundConfigWatcher from "./Watcher/SoundConfigWatcher";
import NewOrderWatcher from "./Watcher/NewOrderWatcher";
import NotificationSettings from "./Notifications/NotificationSettings";
import PartnersContact from "./Partners/Contact";

import {
  getShopOwner,
  getPartner,
} from "@/utils/utils";

export default {
  components: {
    NotificationWatcher,
    SoundConfigWatcher,
    NewOrderWatcher,
    NotificationSettings,
    PartnersContact,
  },
  data() {
    return {
      notificationConfig: {
        soundOn: null,
        infinityNotification: null,
        nameKey: null,
      },
      justCreated: true,
      NotificationSettingsPopup: false,
      shopOwner: null,
      isOpen: false,
    };
  },
  computed: {
    requestTouch() {
      return (
        this.notificationConfig.soundOn &&
        !this.$store.state.soundEnable &&
        this.isIOS
      );
    },
    partner() {
      return getPartner(this.shopOwner);
    },
    ownerUid() {
      return this.$store.getters.isSubAccount
        ? this.$store.getters.parentId
        : this.uid;
    },
    uid() {
      return this.$store.getters.uidAdmin;
    },
  },
  async created() {
    this.notification_detacher = db
      .doc(`restaurants/${this.restaurantId()}/private/notifications`)
      .onSnapshot(
        (notification) => {
          console.log("onSnapshot");
          if (notification.exists) {
            this.notificationConfig = Object.assign(
              this.notificationConfig,
              notification.data()
            );
          }
          /*
          // see PR 674
          if (this.justCreated && this.requestTouch) {
            console.log("*** show Sound Test");
            this.NotificationSettingsPopup = true;
          }
          */
          this.justCreated = false;
        },
        (error) => {
          if (error.code === "permission-denied") {
            // We can ignore this type of error here
            console.warn("Ignoring", error.code);
          } else {
            throw error;
          }
        }
      );
    this.shopOwner = await getShopOwner(this.ownerUid);
  },
  destroyed() {
    this.notification_detacher && this.notification_detacher();
  },
  methods: {
    closeNotificationSettings() {
      this.NotificationSettingsPopup = false;
    },
    openContact() {
      this.isOpen = true;
    },
  },
};
</script>
