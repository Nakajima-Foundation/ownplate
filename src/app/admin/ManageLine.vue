<template>
  <div>
    <!-- Header Area -->
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
              <back-button
                :url="`/admin/restaurants/${restaurantId()}/orders`"
                class="m-t-24 m-r-16"
              />

              <!-- Restaurant Profile -->
              <div class="is-inline-flex flex-center m-l-16 m-t-24">
                <div>
                  <img :src="resizedProfileImage(shopInfo, '600')" class="w-36 h-36 r-36 cover" />
                </div>
                <div class="t-h6 c-text-black-high m-l-8 flex-1">{{ shopInfo.restaurantName }}</div>
              </div>
            </div>
            <!-- Notification Settings -->
            <div class="level-right">
              <notification-index :shopInfo="shopInfo" />
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>

    <!-- Body Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="columns is-gaplress">
          <div class="column is-three-fifths is-offset-one-fifth">
            <div class="m-l-24 m-r-24">
              <!-- LINE Users -->
              <div class="m-t-24">
                <div
                  v-if="lineUsers.length > 0"
                  class="t-h6 c-text-black-disabled"
                >{{$t("admin.order.lineUsers")}}</div>
                <!-- LINE User -->
                <div
                  v-for="lineUser in lineUsers"
                  :key="lineUser.id"
                  class="cols flex-center m-t-8"
                >
                  <!-- Name and Status -->
                  <div
                    class="flex-1 bg-surface r-8 d-low p-l-16 p-r-16 p-t-16 p-b-16 touchable"
                    @click="handleToggle(lineUser)"
                  >
                    <!-- Enabled -->
                    <div v-if="lineUser.notify" class="cols flex-1">
                      <i class="material-icons m-r-8 c-status-green">check_box</i>
                      <span class="t-subtitle1 c-text-black-high">{{ lineUser.displayName }}</span>
                    </div>

                    <!-- Disabled -->
                    <div v-else class="cols flex-1">
                      <i class="material-icons m-r-8 c-text-black-disabled">check_box_outline_blank</i>
                      <span class="t-subtitle1 c-text-black-disabled">{{ lineUser.displayName }}</span>
                    </div>
                  </div>

                  <!-- Delete -->
                  <div
                    class="op-button-pill bg-status-red-bg m-l-8"
                    @click.stop="handleDelete(lineUser.id)"
                  >
                    <i class="material-icons c-status-red touchable">delete</i>
                  </div>
                </div>
              </div>

              <!-- LINE Button -->
              <div class="align-center m-t-24">
                <b-button
                  class="b-reset op-button-small"
                  style="background:#18b900"
                  @click="handleLineAuth"
                >
                  <i class="fab fa-line c-text-white-full m-l-24 m-r-8" style="font-size:24px" />
                  <span class="c-text-white-full m-r-24">
                    {{
                    $t("admin.order.lineAdd")
                    }}
                  </span>
                </b-button>
              </div>

              <!-- Note for Safari Private Browsing Mode -->
              <div class="bg-form r-8 p-l-16 p-r-16 p-t-16 p-b-16 m-t-24 align-left">
                <span class="t-body2 c-text-black-medium">
                  {{
                  $t("admin.order.lineSafariPrivate")
                  }}
                </span>
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
import { db } from "~/plugins/firebase.js";
import BackButton from "~/components/BackButton";
import { lineAuthURL, lineVerify } from "~/plugins/line.js";

import NotificationIndex from "./Notifications/Index";

export default {
  components: {
    BackButton,
    NotificationIndex
  },
  data() {
    return {
      shopInfo: {},
      lineUsers: [],
      detacher: null
    };
  },
  async created() {
    const restaurant_detacher = db
      .doc(`restaurants/${this.restaurantId()}`)
      .onSnapshot(restaurant => {
        if (restaurant.exists) {
          const restaurant_data = restaurant.data();
          this.shopInfo = restaurant_data;
        }
      });
    const lineId = this.$route.query.userId;
    const displayName = this.$route.query.displayName;
    const state = this.$route.query.state;
    if (lineId && displayName && state) {
      if (lineVerify(state)) {
        await db.doc(`restaurants/${this.restaurantId()}/lines/${lineId}`).set(
          {
            displayName,
            notify: true
          },
          { merge: true }
        );
        console.log("registered lineId", lineId);
      } else {
        console.error("invalid state", state);
      }
      this.$router.replace(location.pathname);
    }
  },
  async mounted() {
    this.detacher = db
      .collection(`restaurants/${this.restaurantId()}/lines`)
      .onSnapshot(snapshot => {
        this.lineUsers = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id
          };
        });
      });
  },
  destroyed() {
    this.detacher && this.detacher();
  },
  methods: {
    async handleToggle(lineUser) {
      await db
        .doc(`restaurants/${this.restaurantId()}/lines/${lineUser.id}`)
        .update({
          notify: !lineUser.notify
        });
    },
    handleLineAuth() {
      const url = lineAuthURL("/callback/line", {
        pathname: location.pathname
      });
      location.href = url;
    },
    handleDelete(lineId) {
      this.$store.commit("setAlert", {
        code: "admin.order.lineDelete",
        callback: async () => {
          console.log("handleDelete", lineId);
          await db
            .doc(`restaurants/${this.restaurantId()}/lines/${lineId}`)
            .delete();
        }
      });
    }
  }
};
</script>
