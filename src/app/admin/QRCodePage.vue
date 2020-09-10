<template>
  <div>
    <!-- QR Header Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <!-- Nav Bar -->
          <div class="level">
            <!-- Back Button and Restaurant Profile -->
            <div class="level-left flex-1">
              <!-- Back Button -->
              <back-button url="/admin/restaurants/" class="m-t-24 m-r-16" />
              <!-- Restaurant Profile -->
              <div class="is-inline-flex flex-center m-t-24">
                <div>
                  <img :src="resizedProfileImage(restaurant, '600')" class="w-36 h-36 r-36 cover" />
                </div>
                <div class="t-h6 c-text-black-high m-l-8 flex-1">{{ restaurant.restaurantName }}</div>
              </div>
            </div>
            <!-- Notification Settings -->
            <div class="level-right">
              <notification-index :shopInfo="restaurant" />
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>

    <!-- QR Codes -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>

      <!-- Left Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <!-- Menu Page -->
          <div class="t-h6 c-text-black-disabled m-t-24 p-b-8">{{ $t("admin.qrcode.restaurant") }}</div>
          <div class="bg-surface r-8 d-low p-l-24 p-r-24 p-t-24 p-b-24">
            <!-- QR Code -->
            <div class="align-center">
              <qrcode :value="urlMenu" :options="{ width: 160 }"></qrcode>
            </div>
            <!-- Link -->
            <div class="align-center">
              <a :href="urlMenu" target="_blank">
                <div class="op-button-text t-button">{{ restaurant.restaurantName }}</div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <!-- Trace -->
          <div v-if="trace && regionalSetting.covid19trace">
            <div class="t-h6 c-text-black-disabled m-t-24 p-b-8">{{ $t("trace.list") }}</div>
            <div class="bg-surface r-8 d-low p-l-24 p-r-24 p-t-24 p-b-24">
              <!-- Enter -->
              <div>
                <!-- QR Code -->
                <div class="align-center">
                  <qrcode :value="urlEnter" :options="{ width: 160 }"></qrcode>
                </div>
                <!-- Link -->
                <div class="align-center">
                  <a :href="urlEnter">
                    <div class="op-button-text t-button">{{ $t("admin.qrcode.enter") }}</div>
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
                    <div class="op-button-text t-button">{{ $t("admin.qrcode.leave") }}</div>
                  </a>
                </div>
              </div>

              <!-- Trace List -->
              <div class="align-center m-t-24">
                <router-link :to="`/admin/restaurants/${restaurantId()}/traces`">
                  <div class="op-button-small tertiary">{{ $t("trace.viewList") }}</div>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>
  </div>
</template>

<script>
import { db, firestore } from "~/plugins/firebase.js";
import BackButton from "~/components/BackButton";
import NotificationIndex from "./Notifications/Index";

export default {
  components: {
    BackButton,
    NotificationIndex
  },
  data() {
    return {
      restaurant: {},
      detacher: null,
      trace: null
    };
  },
  created() {
    const refRestaurant = db.doc(`restaurants/${this.restaurantId()}`);
    this.detacher = refRestaurant.onSnapshot(async snapshot => {
      this.restaurant = snapshot.data();
      if (this.restaurant.trace) {
        this.trace = this.restaurant.trace;
      } else {
        const refEnter = refRestaurant.collection("trace").doc();
        const refLeave = refRestaurant.collection("trace").doc();
        console.log("new traceIDs", refEnter.id, refLeave.id);
        await db.runTransaction(async transaction => {
          const data = (await transaction.get(refRestaurant)).data();
          console.log(data);
          if (!data.trace) {
            transaction.set(refEnter, {
              event: "enter",
              uid: this.user.uid,
              traceId: refEnter.id,
              restaurantId: this.restaurantId()
            });
            transaction.set(refLeave, {
              event: "leave",
              uid: this.user.uid,
              traceId: refLeave.id,
              restaurantId: this.restaurantId()
            });
            transaction.update(refRestaurant, {
              trace: {
                enter: refEnter.id,
                leave: refLeave.id
              }
            });
          }
        });
      }
    });
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
    }
  }
};
</script>
