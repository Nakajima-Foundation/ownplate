<template>
  <div>
    <!-- Header -->
    <div class="mt-6 mx-6 lg:flex lg:items-center">
      <!-- Back -->
      <div class="flex space-x-4">
        <div class="flex-shrink-0">
          <back-button :url="`/admin/restaurants/${restaurantId()}/orders`" />
        </div>
      </div>

      <!-- Photo and Name -->
      <div class="mt-4 lg:mt-0 lg:flex-1 lg:flex lg:items-center lg:mx-4">
        <div class="flex items-center">
          <div class="flex-shrink-0 rounded-full bg-black bg-opacity-10 mr-4">
            <img
              :src="resizedProfileImage(shopInfo, '600')"
              class="w-9 h-9 rounded-full object-cover"
            />
          </div>
          <div class="text-base font-bold">
            {{ shopInfo.restaurantName }}
          </div>
        </div>
      </div>

      <!-- Notifications -->
      <div class="mt-4 lg:mt-0 flex-shrink-0">
        <notification-index :shopInfo="shopInfo" />
      </div>
    </div>

    <!-- Body -->
    <div class="mt-6 mx-6 grid-col-1 space-y-4 lg:max-w-2xl lg:mx-auto">
      <!-- Title -->
      <div
        v-if="lineUsers.length > 0"
        class="text-xl font-bold text-black text-opacity-30"
      >
        {{ $t("admin.order.lineUsers") }}
      </div>

      <!-- LINE Users -->
      <div class="mt-6 grid grid-cols-1 space-y-2">
        <div
          v-for="lineUser in lineUsers"
          :key="lineUser.id"
          class="flex items-center"
        >
          <!-- User Name -->
          <div
            class="flex-1 bg-white rounded-lg shadow p-4 cursor-pointer"
            @click="handleToggle(lineUser)"
          >
            <!-- Enabled -->
            <div v-if="lineUser.notify" class="flex items-center">
              <i class="material-icons text-2xl text-green-600 mr-2"
                >check_box</i
              >
              <div class="text-base font-bold">
                {{ lineUser.displayName }}
              </div>
            </div>

            <!-- Disabled -->
            <div v-else class="flex items-center">
              <i class="material-icons text-2xl text-black text-opacity-30 mr-2"
                >check_box_outline_blank</i
              >
              <div class="text-base font-bold text-black text-opacity-30">
                {{ lineUser.displayName }}
              </div>
            </div>
          </div>

          <!-- Delete -->
          <div>
            <a
              class="ml-4 inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
              @click.stop="handleDelete(lineUser.id)"
            >
              <i class="material-icons text-lg text-red-700">delete</i>
            </a>
          </div>
        </div>
      </div>

      <!-- Add LINE User -->
      <div class="mt-6 text-center">
        <b-button @click="handleLineAuth" class="b-reset-tw">
          <div
            class="inline-flex justify-center items-center h-12 px-6 rounded-full"
            style="background: #18b900"
          >
            <i class="fab fa-line text-2xl text-white mr-2" />
            <div class="text-base font-bold text-white">
              {{ $t("admin.order.lineAdd") }}
            </div>
          </div>
        </b-button>
      </div>

      <!-- Note for Safari Private Browsing Mode -->
      <div class="mt-6 bg-black bg-opacity-5 rounded-lg p-4">
        <span class="t-body2 c-text-black-medium">
          {{ $t("admin.order.lineSafariPrivate") }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "~/plugins/firebase.js";
import BackButton from "~/components/BackButton";
import { lineAuthURL, lineVerify } from "~/lib/line/line.js";

import NotificationIndex from "./Notifications/Index";

export default {
  components: {
    BackButton,
    NotificationIndex,
  },
  metaInfo() {
    return {
      title: ["Admin Manage Line", this.defaultTitle].join(" / "),
    };
  },
  data() {
    return {
      shopInfo: {},
      lineUsers: [],
      detacher: null,
    };
  },
  async created() {
    const restaurant_detacher = db
      .doc(`restaurants/${this.restaurantId()}`)
      .onSnapshot((restaurant) => {
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
            notify: true,
            uid: this.uid,
            restaurantId: this.restaurantId(),
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
      .onSnapshot((snapshot) => {
        this.lineUsers = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
          };
        });
      });
  },
  destroyed() {
    this.detacher && this.detacher();
  },
  computed: {
    uid() {
      return this.$store.getters.uidAdmin;
    },
  },
  methods: {
    async handleToggle(lineUser) {
      await db
        .doc(`restaurants/${this.restaurantId()}/lines/${lineUser.id}`)
        .update({
          notify: !lineUser.notify,
        });
    },
    handleLineAuth() {
      const url = lineAuthURL("/callback/line", {
        pathname: location.pathname,
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
        },
      });
    },
  },
};
</script>
