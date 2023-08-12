<template>
<div>
  <template v-if="notFound === null">
  </template>
  <template v-else-if="notFound">
    <not-found />
  </template>
  <div v-else>
      <AdminHeader
        class="mx-6 mt-6 lg:flex lg:items-center"
        :shopInfo="shopInfo"
        :backLink="'/admin/restaurants/#restaurant_' + restaurantId"
        :showSuspend="false"
        pageText="autoPrinter"
      />

    <div>
      <div class="mx-6 mt-6 rounded-lg bg-black bg-opacity-5 p-4 text-center font-bold">
        <div>
          注文が入ったときに、スター精密のレシートプリンターから自動的に注文内容を印刷する機能です。
        </div>
        <a
          href="https://docs.omochikaeri.com/manuals/printer.pdf"
          target="_blank"
          class="font-bold text-op-teal"
          @click="handleClose()"
        >
          {{ $t("menu.printerManualLink") }}
        </a>
      </div>
      <div class="mx-6 mt-6 rounded-lg bg-black bg-opacity-5 p-4 text-center">
        <div class="pb-2 text-sm font-bold">
          CloudPRNT Server URL
        </div>
        <o-input
          type="textarea"
          rows=2
          readonly
          v-model="printerAddress"
          ></o-input>
        <div v-if="printerAddress">
          こちらのURLをプリンターに設定してください。
        </div>
        
      </div>

      <div class="mx-6 mt-6 rounded-lg bg-black bg-opacity-5 p-4 text-center">
        <div class="pb-2 text-sm font-bold">
          Reset Server URL
        </div>
        <o-button @click="reset" class="b-reset-tw">
          <div
            class="inline-flex h-12 items-center justify-center rounded-full bg-op-teal px-6 shadow"
            style="min-width: 8rem"
          >
            <span class="text-base font-bold text-white">
              Reset
            </span>
          </div>
        </o-button>

        
      </div>
      
      <div class="mx-6 mt-6 rounded-lg bg-black bg-opacity-5 p-4 text-center" v-if="false">
        <div class="pb-2 text-sm font-bold">
          IP Address <span class="text-sx text-opacity-20 text-black">if need</span>
        </div>
        <o-input
          v-model="ipaddress"
          ></o-input>
      </div>
      
      <div class="mx-6 mt-6 rounded-lg bg-black bg-opacity-5 p-4 text-center" v-if="false">
        <div class="pb-2 text-sm font-bold">
          Logs
        </div>
        
      </div>
    </div>
  </div>
</div>
</template>

<script>
import {
  defineComponent,
  ref,
  computed,
} from "vue";
import { db } from "@/lib/firebase/firebase9";
import { doc, collection, onSnapshot, setDoc } from "firebase/firestore";

import { ownPlateConfig } from "@/config/project";

import NotFound from "@/components/NotFound.vue";
import AdminHeader from "@/app/admin/AdminHeader.vue";

import {
  useRestaurantId,
} from "@/utils/utils";

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
    
    const restaurantId = useRestaurantId();
    const restaurantRef = doc(db, `restaurants/${restaurantId.value}/private/printer`);
    onSnapshot(
      restaurantRef,
      (doc) => {
        const data = doc.data();
        if (data === undefined) {
          reset();
        }
        printerConfig.value = data || {};
        notFound.value = false;
      }
    );

    const printerAddress = computed(() => {
      if (printerConfig.value?.key) {
        return ["https://" + ownPlateConfig.hostName + "/api/1.0/r/", restaurantId.value, "/starprinter/", printerConfig.value.key ].join("");
      }
      return "";
    });
    const reset = () => {
      const newKey = doc(collection(db, "a")).id;
      setDoc(restaurantRef, {key: newKey}, {merge: true});
    };
    return {
      notFound,
      printerConfig,
      printerAddress,

      reset,
      restaurantId,
    };
  },
});
</script>
