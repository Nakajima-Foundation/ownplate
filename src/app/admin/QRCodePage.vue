<template>
  <div>
    <template v-if="notFound === null"></template>
    <template v-else-if="notFound === true">
      <not-found />
    </template>
    <div v-else-if="notFound === false">
      <!-- QR Header Area -->
      <div class="columns is-gapless">
        <!-- Left Gap -->
        <div class="column is-narrow w-6"></div>
        <!-- Center Column -->
        <div class="column">
          <!-- Nav Bar -->
          <div class="level">
            <!-- Back Button and Restaurant Profile -->
            <AdminHeader
              class="mx-6 mt-6 lg:flex lg:items-center"
              :shopInfo="shopInfo"
              backLink="/admin/restaurants/"
              :showSuspend="false"
              :isInMo="isInMo"
              :moPrefix="moPrefix"
            />
          </div>
        </div>
        <!-- Right Gap -->
        <div class="column is-narrow w-6"></div>
      </div>

      <!-- QR Codes -->
      <div class="columns is-gapless">
        <!-- Left Gap -->
        <div class="column is-narrow w-6"></div>

        <!-- Left Column -->
        <div class="column">
          <div class="ml-6 mr-6">
            <!-- Menu Page -->
            <div class="mt-6 pb-2 text-xl font-bold text-black text-opacity-40">
              {{ $t("admin.qrcode.restaurant") }}
            </div>
            <div class="rounded-lg bg-white pl-6 pr-6 pt-6 pb-6 shadow-md">
              <!-- QR Code -->
              <div class="text-center" @click="download">
                <qrcode
                  :value="urlMenu"
                  :options="{ width: 160 }"
                  ref="qrcodeRef"
                ></qrcode>
              </div>
              <!-- Link -->
              <div class="text-center">
                <a :href="urlMenu" target="_blank">
                  <div
                    class="inline-flex min-h-[36px] cursor-pointer items-center justify-center px-2 font-bold text-op-teal"
                  >
                    {{ shopInfo.restaurantName }}
                  </div>
                </a>
              </div>
              <!-- Download -->
              <div class="text-center" @click="download">
                <div
                  class="inline-flex min-h-[36px] cursor-pointer items-center justify-center px-2 font-bold text-op-teal"
                >
                  {{ $t("admin.qrcode.download") }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="column"></div>
        <!-- Right Gap -->
        <div class="column is-narrow w-6"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import { db } from "@/plugins/firebase";
import AdminHeader from "@/app/admin/AdminHeader.vue";
import { shareUrlAdmin } from "@/utils/utils";

import { useAdminUids, notFoundResponse } from "@/utils/utils";
import { checkShopAccount } from "@/utils/userPermission";

import NotFound from "@/components/NotFound.vue";

export default defineComponent({
  components: {
    AdminHeader,
    NotFound,
  },
  metaInfo() {
    return {
      title: this.shopInfo.restaurantName
        ? [
            "Admin QRCode",
            this.shopInfo.restaurantName,
            this.defaultTitle,
          ].join(" / ")
        : this.defaultTitle,
    };
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
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
  setup(props, ctx) {
    const { ownerUid } = useAdminUids();
    if (!checkShopAccount(props.shopInfo, ownerUid.value)) {
      return notFoundResponse;
    }

    const urlMenu = shareUrlAdmin(props);
    const qrcodeRef = ref();

    const download = () => {
      const a = document.createElement("a");
      console.log(qrcodeRef);
      a.href = qrcodeRef.value.$el.toDataURL("image/png");
      a.download = "qrcode.png";
      a.click();
    };

    return {
      urlMenu,
      download,
      qrcodeRef,

      notFound: false,
    };
  },
});
</script>
