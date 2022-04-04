<template>
  <div>
    <div v-if="partner && partner.length > 0" class="mt-3 mx-6 items-center">
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

<script lang="ts">
import { db, firestore } from "@/plugins/firebase";
import { defineComponent, ref, computed, watch, onUnmounted } from "@vue/composition-api";

import NotificationWatcher from "./Watcher/NotificationWatcher.vue";
import SoundConfigWatcher from "./Watcher/SoundConfigWatcher.vue";
import NewOrderWatcher from "./Watcher/NewOrderWatcher.vue";
import NotificationSettings from "./Notifications/NotificationSettings.vue";
import PartnersContact from "./Partners/Contact.vue";

import { PartnerData } from "@/models/ShopOwner";

import {
  getShopOwner,
  getPartner,
} from "@/utils/utils";

export default defineComponent({
  components: {
    NotificationWatcher,
    SoundConfigWatcher,
    NewOrderWatcher,
    NotificationSettings,
    PartnersContact,
  },
  /*
  computed: {
    requestTouch() {
      return (
        this.notificationConfig.soundOn &&
        !this.$store.state.soundEnable &&
        this.isIOS
      );
    },
  },
  */
  setup(_, ctx) {
    const restaurantId = computed(() => {
      return ctx.root.$route.params.restaurantId;
    });
    const uid = computed(() => {
      return ctx.root.$store.getters.uidAdmin;
    });
    const ownerUid = computed(() => {
      return ctx.root.$store.getters.isSubAccount
        ? ctx.root.$store.getters.parentId
        : uid.value;
    });
    const notificationConfig = ref({
      soundOn: null,
      infinityNotification: null,
      nameKey: null,
    });
    const NotificationSettingsPopup = ref(false);
    const isOpen = ref(false);

    const notification_detacher = ref();
    notification_detacher.value = db
      .doc(`restaurants/${restaurantId.value}/private/notifications`)
      .onSnapshot(
        (notification) => {
          console.log("onSnapshot");

          if (notification.exists) {
            notificationConfig.value = Object.assign(
              notificationConfig.value,
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
          // this.justCreated = false;
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
    onUnmounted(() => {
      if (notification_detacher.value) {
        notification_detacher.value();
      }
    });
    
    const partner = ref<(PartnerData|undefined)[]>([]);
    (async () => {
      const shopOwner = await getShopOwner(ownerUid.value);
      partner.value = await getPartner(shopOwner);
    })()
    const closeNotificationSettings = () => {
      NotificationSettingsPopup.value = false;
    };
    const openContact = () => {
      isOpen.value = true;
    };

    return {
      partner,
      notificationConfig,

      closeNotificationSettings,
      NotificationSettingsPopup,

      openContact,
      isOpen,
      
    };
  },
});
</script>
