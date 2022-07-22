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
    <NotFound v-if="noRestaurant === true" />
    <router-view
      :shopInfo="shopInfo"
      :groupData="groupData"
      :groupMasterRestaurant="groupMasterRestaurant"
      v-else-if="noRestaurant === false"
    ></router-view>
    <notification-watcher />
    <sound-config-watcher :notificationConfig="notificationConfig" />
    <new-order-watcher :notificationConfig="notificationConfig" />
    <b-modal :active.sync="isOpen" :width="488">
      <PartnersContact :id="(partner[0] || {}).id" />
    </b-modal>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  watch,
  onUnmounted,
} from "@vue/composition-api";
import { db } from "@/lib/firebase/firebase9";
import { doc, onSnapshot, getDoc, DocumentData } from "firebase/firestore";

import NotificationWatcher from "./Watcher/NotificationWatcher.vue";
import SoundConfigWatcher from "./Watcher/SoundConfigWatcher.vue";
import NewOrderWatcher from "./Watcher/NewOrderWatcher.vue";
import NotificationSettings from "./Notifications/NotificationSettings.vue";
import PartnersContact from "./Partners/Contact.vue";
import NotFound from "@/components/NotFound.vue";

import { PartnerData } from "@/models/ShopOwner";

import { getShopOwner, getPartner, regionalSetting } from "@/utils/utils";

import { defaultShopInfo } from "@/utils/admin/RestaurantPageUtils";

export default defineComponent({
  components: {
    NotFound,
    NotificationWatcher,
    SoundConfigWatcher,
    NewOrderWatcher,
    NotificationSettings,
    PartnersContact,
  },
  props: {
    groupMasterRestaurant: {
      type: Object,
      required: false,
    },
  },
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

    const noRestaurant = ref<boolean | null>(null);
    const shopInfo = ref(defaultShopInfo);
    const groupData = ref<null | DocumentData>(null);
    
    // never use onSnapshot here.
    const defaultTax = regionalSetting.defaultTax || {};

    const restaurantRef = doc(db, `restaurants/${restaurantId.value}`);
    const restaurant_detacher = ref();
    restaurant_detacher.value = onSnapshot(restaurantRef, async (restaurant) => {
      if (!restaurant.exists()) {
        noRestaurant.value = true;
        return;
      }
      const restaurant_data = restaurant.data();
      if (restaurant_data.groupId) {
        const groupDoc = await getDoc(doc(db, (`groups/${restaurant_data.groupId}`)))
        if (groupDoc.exists()) {
          groupData.value = groupDoc.data();
        }
      }
      
      const loadShopInfo = Object.assign(
        {},
        defaultShopInfo,
        restaurant_data,
        defaultTax
      );
      if (loadShopInfo.temporaryClosure) {
        loadShopInfo.temporaryClosure = loadShopInfo.temporaryClosure.map(
          (day: any) => {
            return day.toDate();
          }
        );
      }
      shopInfo.value = loadShopInfo;
      noRestaurant.value = false;
    });

    const notification_detacher = ref();
    notification_detacher.value = onSnapshot(
      doc(db, `restaurants/${restaurantId.value}/private/notifications`),
      (notification) => {
        console.log("onSnapshot");
        if (notification.exists()) {
          notificationConfig.value = Object.assign(
            notificationConfig.value,
            notification.data()
          );
        }
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
      if (restaurant_detacher.value) {
        restaurant_detacher.value();
      }
    });

    const partner = ref<(PartnerData | undefined)[]>([]);
    (async () => {
      const shopOwner = await getShopOwner(ownerUid.value);
      partner.value = await getPartner(shopOwner);
    })();
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

      shopInfo,
      groupData,
      noRestaurant,
    };
  },
});
</script>
