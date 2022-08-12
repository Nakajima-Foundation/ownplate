<template>
  <div>
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
        <div class="m-l-24 m-r-24">
          <!-- Menu Page -->
          <div class="t-h6 c-text-black-disabled m-t-24 p-b-8">
            {{ $t("admin.qrcode.restaurant") }}
          </div>
          <div class="bg-surface rounded-lg d-low p-l-24 p-r-24 p-t-24 p-b-24">
            <!-- QR Code -->
            <div class="align-center" @click="download">
              <qrcode
                :value="urlMenu"
                :options="{ width: 160 }"
                ref="qrcode"
              ></qrcode>
            </div>
            <!-- Link -->
            <div class="align-center">
              <a :href="urlMenu" target="_blank">
                <div class="op-button-text t-button">
                  {{ shopInfo.restaurantName }}
                </div>
              </a>
            </div>
            <!-- Download -->
            <div class="align-center" @click="download">
              <div class="op-button-text t-button">
                {{ $t("admin.qrcode.download") }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <!-- Trace -->
          <div v-if="trace && regionalSetting.covid19trace">
            <div class="t-h6 c-text-black-disabled m-t-24 p-b-8">
              {{ $t("trace.list") }}
            </div>
            <div
              class="bg-surface rounded-lg d-low p-l-24 p-r-24 p-t-24 p-b-24"
            >
              <!-- Enter -->
              <div>
                <!-- QR Code -->
                <div class="align-center">
                  <qrcode :value="urlEnter" :options="{ width: 160 }"></qrcode>
                </div>
                <!-- Link -->
                <div class="align-center">
                  <a :href="urlEnter">
                    <div class="op-button-text t-button">
                      {{ $t("admin.qrcode.enter") }}
                    </div>
                  </a>
                </div>
              </div>

              <!-- Leave -->
              <div class="m-t-48">
                <!-- QR Code -->
                <div class="align-center">
                  <qrcode :value="urlLeave" :options="{ width: 160 }"></qrcode>
                </div>
                <!-- Link -->
                <div class="align-center">
                  <a :href="urlLeave">
                    <div class="op-button-text t-button">
                      {{ $t("admin.qrcode.leave") }}
                    </div>
                  </a>
                </div>
              </div>

              <!-- Trace List -->
              <div class="align-center m-t-24">
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
</template>

<script>
import { db, firestore } from "@/plugins/firebase";
import AdminHeader from "@/app/admin/AdminHeader.vue";

export default {
  components: {
    AdminHeader,
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
      required: true,
    },
  },
  data() {
    return {
      detacher: null,
      trace: null,
    };
  },
  created() {
    (async () => {
      if (this.shopInfo.trace) {
        this.trace = this.shopInfo.trace;
      } else {
        const refRestaurant = db.doc(`restaurants/${this.restaurantId()}`);
        const refEnter = refRestaurant.collection("trace").doc();
        const refLeave = refRestaurant.collection("trace").doc();
        console.log("new traceIDs", refEnter.id, refLeave.id);
        await db.runTransaction(async (transaction) => {
          console.log(data);
          if (!data.trace) {
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
          }
        });
      }
    })();
  },
  destroyed() {
    this.detacher && this.detacher();
  },
  computed: {
    urlEnter() {
      return `${location.origin}/t/${this.trace.enter}`;
    },
    urlLeave() {
      return `${location.origin}/t/${this.trace.leave}`;
    },
    urlMenu() {
      return this.shareUrl();
    },
  },
  methods: {
    download() {
      const a = document.createElement("a");
      a.href = this.$refs.qrcode.$el.toDataURL("image/png");
      a.download = "qrcode.png";
      a.click();
    },
  },
};
</script>
