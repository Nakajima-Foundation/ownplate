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
          <div class="text-right font-bold" v-if="part.ask">
            <a href="#" @click="openContact()">サポート問い合わせ</a>
          </div>
        </div>
      </div>
      <!-- Notification Settings Popup-->
      <router-view
        :shopInfo="shopInfo"
        :groupData="groupData"
        :groupMasterRestaurant="groupMasterRestaurant"
        :isInMo="isInMo"
        :moPrefix="moPrefix"
        v-if="noRestaurant === false"
      ></router-view>
      <NotificationWatcher :notificationConfig="notificationConfig" />
      <SoundConfigWatcher :notificationConfig="notificationConfig" />
      <NewOrderWatcher :notificationConfig="notificationConfig" />
      <o-modal :active.sync="isOpen" :width="488">
        <PartnersContact :id="(partner[0] || {}).id" />
      </o-modal>
    </div>
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
import PartnersContact from "./Partners/Contact.vue";
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
  props: {
    groupMasterRestaurant: {
      type: Object,
      required: false,
    },
    isInMo: {
      type: Boolean,
      required: true,
    },
    moPrefix: {
      type: String,
      required: false,
    },
  },
  setup(_, ctx) {
    const restaurantId = useRestaurantId(ctx.root);
    const { uid, ownerUid } = useAdminUids(ctx);

    const notificationConfig = ref({
      soundOn: null,
      infinityNotification: null,
      nameKey: null,
    });
    const isOpen = ref(false);

    const noRestaurant = ref<boolean | null>(null);
    const shopInfo = ref(defaultShopInfo);
    const groupData = ref<null | DocumentData>(null);

    if (!checkAdminPermission(ctx)) {
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
    const restaurant_detacher = ref();
    restaurant_detacher.value = onSnapshot(
      restaurantRef,
      async (restaurant) => {
        if (!restaurant.exists()) {
          noRestaurant.value = true;
          return;
        }
        const restaurant_data = restaurant.data();
        if (restaurant_data.groupId) {
          const groupDoc = await getDoc(
            doc(db, `groups/${restaurant_data.groupId}`)
          );
          if (groupDoc.exists()) {
            groupData.value = groupDoc.data();
          }
        }

        const copy =  JSON.parse(JSON.stringify(defaultShopInfo));
        const loadShopInfo = Object.assign(
          {},
          copy,
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
      },
      (e) => {
        console.log(e);
        noRestaurant.value = true;
        return;
      }
    );

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
    const openContact = () => {
      isOpen.value = true;
    };

    return {
      notificationConfig,

      partner,
      openContact,
      isOpen,

      shopInfo,
      groupData,
      noRestaurant,
    };
  },
});
</script>
