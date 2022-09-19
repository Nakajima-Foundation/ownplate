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
              class="mt-6 mx-6 lg:flex lg:items-center"
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
            <div class="t-h6 text-black text-opacity-40 mt-6 pb-2">
              {{ $t("admin.qrcode.restaurant") }}
            </div>
            <div
              class="bg-white rounded-lg shadow-md pl-6 pr-6 pt-6 pb-6"
            >
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
                  <div class="op-button-text t-button">
                    {{ shopInfo.restaurantName }}
                  </div>
                </a>
              </div>
              <!-- Download -->
              <div class="text-center" @click="download">
                <div class="op-button-text t-button">
                  {{ $t("admin.qrcode.download") }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="column">
          <div class="ml-6 mr-6">
            <!-- Trace -->
            <div v-if="trace && regionalSetting.covid19trace">
              <div class="t-h6 text-black text-opacity-40 mt-6 pb-2">
                {{ $t("trace.list") }}
              </div>
              <div
                class="bg-white rounded-lg shadow-md pl-6 pr-6 pt-6 pb-6"
              >
                <!-- Enter -->
                <div>
                  <!-- QR Code -->
                  <div class="text-center">
                    <qrcode
                      :value="urlEnter"
                      :options="{ width: 160 }"
                    ></qrcode>
                  </div>
                  <!-- Link -->
                  <div class="text-center">
                    <a :href="urlEnter">
                      <div class="op-button-text t-button">
                        {{ $t("admin.qrcode.enter") }}
                      </div>
                    </a>
                  </div>
                </div>

                <!-- Leave -->
                <div class="mt-12">
                  <!-- QR Code -->
                  <div class="text-center">
                    <qrcode
                      :value="urlLeave"
                      :options="{ width: 160 }"
                    ></qrcode>
                  </div>
                  <!-- Link -->
                  <div class="text-center">
                    <a :href="urlLeave">
                      <div class="op-button-text t-button">
                        {{ $t("admin.qrcode.leave") }}
                      </div>
                    </a>
                  </div>
                </div>

                <!-- Trace List -->
                <div class="text-center mt-6">
                  <router-link
                    :to="`/admin/restaurants/${restaurantId()}/traces`"
                  >
                    <div class="op-button-small tertiary">
                      {{ $t("trace.viewList") }}
                    </div>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Right Gap -->
        <div class="column is-narrow w-6"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from "@vue/composition-api";
import { db, firestore } from "@/plugins/firebase";
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
  data() {
    return {
      trace: null,
    };
  },
  setup(props, ctx) {
    const { ownerUid } = useAdminUids(ctx);
    console.log(checkShopAccount(props.shopInfo, ownerUid.value));
    if (!checkShopAccount(props.shopInfo, ownerUid.value)) {
      return notFoundResponse;
    }

    const trace = props.shopInfo.trace;
    /*
    (async () => {
      if (props.shopInfo.trace) {
      const trace = props.shopInfo.trace;
      } else {
        const refRestaurant = db.doc(`restaurants/${this.restaurantId()}`);
        const refEnter = refRestaurant.collection("trace").doc();
        const refLeave = refRestaurant.collection("trace").doc();
        console.log("new traceIDs", refEnter.id, refLeave.id);
        await db.runTransaction(async (transaction) => {
          transaction.set(refEnter, {
            event: "enter",
            uid: this.user.uid,
            traceId: refEnter.id,
            restaurantId: this.restaurantId(),
            });
          transaction.set(refLeave, {
            event: "leave",
            uid: this.user.uid,
            traceId: refLeave.id,
            restaurantId: this.restaurantId(),
          });
          transaction.update(refRestaurant, {
            trace: {
              enter: refEnter.id,
                leave: refLeave.id,
            },
          });
          });
      }
    })();
    */

    const urlEnter = trace ? `${location.origin}/t/${trace.enter}` : "";
    const urlLeave = trace ? `${location.origin}/t/${trace.leave}` : "";
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
      trace,
      urlEnter,
      urlLeave,
      urlMenu,
      download,

      qrcodeRef,

      notFound: false,
    };
  },
});
</script>
