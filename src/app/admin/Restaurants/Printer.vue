<template>
  <div>
    <template v-if="notFound === null"> </template>
    <template v-else-if="notFound">
      <not-found />
    </template>
    <div v-else>
      <AdminHeader
        class="mx-6 mt-4 lg:flex lg:items-center"
        :shopInfo="shopInfo"
        :backLink="'/admin/restaurants/#restaurant_' + restaurantId"
        :showSuspend="false"
        pageText="autoPrinter"
      />

      <div>
        <div class="mx-6 mt-4 rounded-lg bg-black/5 p-4 font-bold">
          <div>
            {{ $t("printer.description") }}
          </div>
          <a
            href="https://docs.omochikaeri.com/manuals/printer.pdf"
            target="_blank"
            class="text-op-teal font-bold"
          >
            {{ $t("menu.printerManualLink") }}
          </a>
        </div>
        <div class="mx-6 mt-4 rounded-lg bg-black/5 p-4">
          <div class="pb-2 text-sm font-bold">
            {{ $t("printer.serverURL") }}
          </div>
          <o-input
            type="textarea"
            rows="2"
            readonly
            v-model="printerAddress"
            rootClass="w-full"
          ></o-input>
          <div v-if="printerAddress">
            {{ $t("printer.guidance") }}
          </div>
        </div>

        <div class="mx-6 mt-4 p-4 text-center">
          <t-button @click="reset" class="h-12 px-8 font-bold text-white">
            {{ $t("printer.reset") }}
          </t-button>
        </div>

        <div class="mx-6 mt-4 rounded-lg bg-black/5 p-4" v-if="false">
          <div class="pb-2 text-sm font-bold">
            IP Address
            <span class="text-sx text-black/20">if need</span>
          </div>
          <o-input v-model="ipaddress"></o-input>
        </div>

        <div class="mx-6 mt-4 rounded-lg bg-black/5 p-4" v-if="false">
          <div class="pb-2 text-sm font-bold">Logs</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import { db } from "@/lib/firebase/firebase9";
import { doc, collection, onSnapshot, setDoc } from "firebase/firestore";

import { ownPlateConfig } from "@/config/project";

import NotFound from "@/components/NotFound.vue";
import AdminHeader from "@/app/admin/AdminHeader.vue";

import { useRestaurantId } from "@/utils/utils";

export default defineComponent({
  components: {
    AdminHeader,
    NotFound,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const notFound = ref(null);
    const printerConfig = ref();
    const ipaddress = ref(""); // memo not implemented

    const restaurantId = useRestaurantId();
    const restaurantRef = doc(
      db,
      `restaurants/${restaurantId.value}/private/printer`,
    );
    const reset = () => {
      const newKey = doc(collection(db, "a")).id;
      setDoc(restaurantRef, { key: newKey }, { merge: true });
    };
    onSnapshot(restaurantRef, (_doc) => {
      const data = _doc.data();
      if (data === undefined) {
        reset();
      }
      printerConfig.value = data || {};
      notFound.value = false;
    });

    const printerAddress = computed(() => {
      if (printerConfig.value?.key) {
        return [
          "https://" + ownPlateConfig.hostName + "/api/1.0/r/",
          restaurantId.value,
          "/starprinter/",
          printerConfig.value.key,
        ].join("");
      }
      return "";
    });
    return {
      notFound,
      printerConfig,
      printerAddress,

      reset,
      restaurantId,

      ipaddress,
    };
  },
});
</script>
