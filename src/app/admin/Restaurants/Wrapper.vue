<template>
  <div>
    <div v-if="noRestaurant === null"></div>
    <div v-else-if="noRestaurant === true">
      <NotFound />
    </div>
    <div v-else>
      <div v-if="partner && partner.length > 0" class="mx-6 mt-3 items-center">
        <div v-for="(part, k) in partner" :key="k" class="flex">
          <div class="flex-1">
            <img :src="`/partners/${part.logo}`" class="w-12" />
            <span class="font-bold">
              {{ part.name }}
            </span>
          </div>
          <div class="text-right font-bold cursor-pointer" v-if="part.ask">
            <a href="#" @click="openContact()">サポート問い合わせ</a>
          </div>
        </div>
      </div>
      <!-- Notification Settings Popup-->
      <router-view
        :shopInfo="shopInfo"
        v-if="noRestaurant === false"
        @updateRestaurant="updateRestaurant"
      ></router-view>
      <NotificationWatcher :notificationConfig="notificationConfig" />
      <SoundConfigWatcher :notificationConfig="notificationConfig" />
      <NewOrderWatcher :notificationConfig="notificationConfig" />
      <t-modal v-model:active="isOpen" width="488">
        <PartnersContact :id="(partner[0] || {}).id" />
      </t-modal>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onUnmounted } from "vue";
import { db } from "@/lib/firebase/firebase9";
import { doc, onSnapshot, getDoc } from "firebase/firestore";

import NotificationWatcher from "@/app/admin/Watcher/NotificationWatcher.vue";
import SoundConfigWatcher from "@/app/admin/Watcher/SoundConfigWatcher.vue";
import NewOrderWatcher from "@/app/admin/Watcher/NewOrderWatcher.vue";
import PartnersContact from "@/app/admin/Partners/Contact.vue";
import NotFound from "@/components/NotFound.vue";

import { PartnerData } from "@/models/ShopOwner";
import { ping } from "@/lib/firebase/functions";

import {
  getShopOwner,
  getPartner,
  regionalSetting,
  useRestaurantId,
  useAdminUids,
} from "@/utils/utils";

import { defaultShopInfo } from "@/utils/admin/RestaurantPageUtils";
import { checkAdminPermission } from "@/utils/userPermission";

export default defineComponent({
  components: {
    NotFound,
    NotificationWatcher,
    SoundConfigWatcher,
    NewOrderWatcher,
    PartnersContact,
  },
  setup() {
    const restaurantId = useRestaurantId();
    const { ownerUid } = useAdminUids();

    const notificationConfig = ref({
      soundOn: null,
      infinityNotification: null,
      nameKey: null,
    });
    const isOpen = ref(false);

    const noRestaurant = ref<boolean | null>(null);
    const shopInfo = ref(defaultShopInfo);

    if (!checkAdminPermission()) {
      return {
        noRestaurant: true,
      };
    }
    ping({
      operationType: "layout",
      restaurantId: restaurantId.value,
      pathName: location.pathname,
    });

    // never use onSnapshot here.
    const defaultTax = regionalSetting.defaultTax || {};

    const restaurantRef = doc(db, `restaurants/${restaurantId.value}`);
    const updateRestaurant = async () => {
      const restaurant = await getDoc(restaurantRef);
      if (!restaurant || !restaurant.exists()) {
        noRestaurant.value = true;
        return;
      }
      const restaurant_data = restaurant.data();
      const copy = JSON.parse(JSON.stringify(defaultShopInfo));
      const loadShopInfo = Object.assign({}, copy, restaurant_data, defaultTax);
      if (loadShopInfo.temporaryClosure) {
        loadShopInfo.temporaryClosure = loadShopInfo.temporaryClosure.map(
          (day: any) => {
            return day.toDate();
          },
        );
      }
      shopInfo.value = loadShopInfo;
      noRestaurant.value = false;
    };
    updateRestaurant();

    const notification_detacher = ref();
    notification_detacher.value = onSnapshot(
      doc(db, `restaurants/${restaurantId.value}/private/notifications`),
      (notification) => {
        console.log("onSnapshot");
        if (notification.exists()) {
          notificationConfig.value = Object.assign(
            notificationConfig.value,
            notification.data(),
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
      },
    );
    onUnmounted(() => {
      if (notification_detacher.value) {
        notification_detacher.value();
      }
    });

    const partner = ref<(PartnerData | undefined)[]>([]);
    (async () => {
      const shopOwner = await getShopOwner(ownerUid.value);
      partner.value = await getPartner(shopOwner);
    })();
    const openContact = () => {
      isOpen.value = true;
    };

    return {
      notificationConfig,

      partner,
      openContact,
      isOpen,

      shopInfo,
      noRestaurant,
      updateRestaurant,
    };
  },
});
</script>
