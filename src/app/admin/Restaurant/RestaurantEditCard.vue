<template>
  <div>
    <div class="bg-white shadow rounded-lg p-4">
      <!-- Restaurant Name -->
      <div class="text-lg font-bold inline-flex justify-center items-center">
        <span>{{ shopInfo.restaurantName || $t("editRestaurant.noRestaurant") }}</span>
        <i class="material-icons text-xl text-op-teal" v-if="shopInfo.enableDelivery"> delivery_dining </i>

      </div>
      
      <!-- Restaurant Photo and Details -->
      <div class="flex justify-center items-center space-x-4 mt-4">
        <div class="flex-shrink-0">
          <img
            class="w-20 h-20 rounded-full object-cover"
            :src="
              resizedProfileImage(shopInfo, '600') ||
              '/OwnPlate-Favicon-Default.png'
            "
          />
        </div>

        <div>
          <div>
            <router-link :to="'/r/' + restaurantid">
              <div
                class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
              >
                <i class="material-icons text-lg text-op-teal mr-2">launch</i>
                <span class="text-sm font-bold text-op-teal">{{
                  $t("admin.viewPage")
                }}</span>
              </div>
            </router-link>
          </div>
          <div class="mt-2" v-if="isOwner">
            <router-link :to="'/admin/restaurants/' + restaurantid">
              <div
                class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
              >
                <i class="material-icons text-lg text-op-teal mr-2">edit</i>
                <span class="text-sm font-bold text-op-teal">{{
                  $t("admin.editAbout")
                }}</span>
              </div>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Not Published Alert -->
      <div class="mt-4" v-if="!shopInfo.publicFlag">
        <router-link :to="'/admin/restaurants/' + restaurantid">
          <div
            class="bg-red-700 bg-opacity-10 rounded-md text-sm font-bold text-red-700 px-4 py-2"
          >
            {{ $t("admin.privateMode") }}: {{ $t("admin.pleaseChangePublic") }}
          </div>
        </router-link>
      </div>

      <!-- View Orders -->
      <div class="mt-4 text-center">
        <router-link
          :to="
            '/admin/restaurants/' +
            restaurantid +
            (shopInfo.isEC ? '/history' : '/orders')
          "
        >
          <div
            class="h-16 rounded-full inline-flex justify-center items-center px-8 shadow w-full"
            :class="numberOfOrders > 0 ? 'bg-yellow-500' : 'bg-op-teal'"
          >
            <span class="text-lg font-bold text-white">
              {{ $tc("admin.viewOrders") }}</span
            ><span
              class="text-sm font-bold text-white bg-white bg-opacity-20 px-3 py-2 rounded-full ml-4"
              >{{
                $tc("admin.incompleteOrders", numberOfOrders, {
                  count: numberOfOrders,
                })
              }}</span
            >
          </div>
        </router-link>
      </div>

      <!-- Edit Menu -->
      <div class="mt-4 text-center px-4">
        <!-- Menu Not Existing -->
        <div v-if="numberOfMenus == 0">
          <router-link :to="'/admin/restaurants/' + restaurantid + '/menus'">
            <div
              class="h-12 rounded-full inline-flex justify-center items-center px-6 border-2 border-solid border-red-700 w-full"
            >
              <span class="text-red-700 text-base font-bold">
                {{ $t("admin.editMenuItems") }}</span
              >
              <span
                class="text-base font-bold text-red-700 bg-red-700 bg-opacity-10 px-2 rounded-full ml-2"
                >{{ numberOfMenus }}</span
              >
            </div>
          </router-link>
          <div class="text-sm font-bold text-red-700 mt-2">
            {{ $t("admin.pleaseAddMenu") }}
          </div>
        </div>

        <!-- Menu Existing -->
        <div v-else>
          <router-link :to="'/admin/restaurants/' + restaurantid + '/menus'">
            <div
              class="h-12 rounded-full inline-flex justify-center items-center px-6 border-2 border-solid border-op-teal w-full"
            >
              <span class="text-op-teal text-base font-bold">
                {{ $t("admin.editMenuItems") }}</span
              >
              <span
                class="text-base font-bold bg-black bg-opacity-5 px-2 rounded-full ml-2"
                >{{ numberOfMenus }}</span
              >
            </div>
          </router-link>
        </div>
      </div>

      <!-- Notifications Settings -->
      <div
        class="text-center bg-black bg-opacity-5 rounded-lg pt-3 pb-2 mt-4 flex justify-evenly"
        v-if="isOwner"
      >
        <router-link
          :to="'/admin/restaurants/' + restaurantid + '#emailNotification'"
        >
          <div
            :class="
              shopInfo.emailNotification
                ? 'text-green-600'
                : 'text-black text-opacity-40'
            "
          >
            <div class="text-sm font-bold">
              {{ $t("editRestaurant.emailNotification") }}
            </div>
            <div class="text-base font-bold">
              {{ shopInfo.emailNotification ? "ON" : "OFF" }}
            </div>
          </div>
        </router-link>

        <router-link :to="'/admin/restaurants/' + restaurantid + '#phoneCall'">
          <div
            :class="
              shopInfo.phoneCall
                ? 'text-green-600'
                : 'text-black text-opacity-40'
            "
          >
            <div class="text-sm font-bold">
              {{ $t("editRestaurant.phoneCallNotification") }}
            </div>
            <div class="text-base font-bold">
              {{ shopInfo.phoneCall ? "ON" : "OFF" }}
            </div>
          </div>
        </router-link>

        <router-link :to="'/admin/restaurants/' + restaurantid + '/line'">
          <div
            :class="
              lineEnable ? 'text-green-600' : 'text-black text-opacity-40'
            "
          >
            <div class="text-sm font-bold">
              {{ $t("editRestaurant.lineNotification") }}
            </div>
            <div class="text-base font-bold">
              {{ lineEnable ? "ON" : "OFF" }}
            </div>
          </div>
        </router-link>
      </div>

      <!-- QR Code and Monthly Report -->
      <div class="flex justify-center items-center space-x-4 mt-4">
        <div>
          <router-link :to="`/admin/restaurants/${restaurantid}/qrcode`">
            <div
              class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons text-lg text-op-teal mr-2">qr_code_2 </i>
              <span class="text-sm font-bold text-op-teal">{{
                $t("admin.qrcode.title")
              }}</span>
            </div>
          </router-link>
        </div>

        <div v-if="isOwner">
          <router-link :to="`/admin/restaurants/${restaurantid}/report`">
            <div
              class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons text-lg text-op-teal mr-2"
                >description</i
              >
              <span class="text-sm font-bold text-op-teal">{{
                $t("admin.report.title")
              }}</span>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Directory Request -->
      <div v-if="isOwner">
        <!-- On Directory -->
        <div v-if="shopInfo.onTheList" class="text-center mt-4">
          <div>
            <span class="text-sm font-bold text-black text-opacity-40"
              >{{ $t("admin.directory.status") }}:</span
            >
            <span class="text-sm font-bold text-green-600">{{
              $t("admin.directory.listed")
            }}</span>
          </div>
          <div class="mt-2">
            <a
              @click="deleteFromList"
              class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
            >
              <span class="text-sm font-bold text-op-teal">{{
                $t("admin.directory.unlist")
              }}</span>
            </a>
          </div>
        </div>

        <!-- Requested -->
        <div v-else-if="requestState == 1" class="text-center mt-4">
          <div>
            <span class="text-sm font-bold text-black text-opacity-40"
              >{{ $t("admin.directory.status") }}:</span
            >
            <span class="text-sm font-bold text-yellow-500">{{
              $t("admin.directory.waiting")
            }}</span>
          </div>
          <div class="mt-2">
            <a
              @click="requestDelete"
              class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
            >
              <span class="text-sm font-bold text-red-700">{{
                $t("admin.directory.cancelRequest")
              }}</span>
            </a>
          </div>
        </div>

        <!-- Off Directory -->
        <div v-else class="text-center mt-4">
          <div>
            <span class="text-sm font-bold text-black text-opacity-40"
              >{{ $t("admin.directory.status") }}:</span
            >
            <span class="text-sm font-bold text-black text-opacity-60">
              {{ $t("admin.directory.notListed") }}</span
            >
          </div>
          <div class="mt-2">
            <a
              @click="requestList"
              class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
            >
              <span class="text-sm font-bold text-op-teal">
                {{ $t("admin.directory.requestList") }}</span
              >
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Sort and Delete -->
    <div class="flex justify-end space-x-2 mt-2 pb-2" v-if="isOwner">
      <!-- Up -->
      <div>
        <template v-if="position !== 'first'">
          <b-button @click="positionUp" class="b-reset-tw">
            <div
              class="inline-flex justify-center items-center px-4 h-9 rounded-full bg-black bg-opacity-5"
            >
              <i class="material-icons text-lg text-op-teal">arrow_upward</i>
            </div>
          </b-button>
        </template>

        <template v-else>
          <b-button disabled class="b-reset-tw">
            <div
              class="inline-flex justify-center items-center px-4 h-9 rounded-full bg-black bg-opacity-5"
            >
              <i class="material-icons text-lg text-op-teal">arrow_upward</i>
            </div>
          </b-button>
        </template>
      </div>

      <!-- Down -->
      <div>
        <template v-if="position !== 'last'">
          <b-button @click="positionDown" class="b-reset-tw">
            <div
              class="inline-flex justify-center items-center px-4 h-9 rounded-full bg-black bg-opacity-5"
            >
              <i class="material-icons text-lg text-op-teal">arrow_downward</i>
            </div>
          </b-button>
        </template>

        <template v-else>
          <b-button disabled class="b-reset-tw">
            <div
              class="inline-flex justify-center items-center px-4 h-9 rounded-full bg-black bg-opacity-5"
            >
              <i class="material-icons text-lg text-op-teal">arrow_downward</i>
            </div>
          </b-button>
        </template>
      </div>

      <!-- Delete -->
      <div>
        <button @click="deleteRestaurant" class="b-reset-tw">
          <div
            class="inline-flex justify-center items-center px-4 h-9 rounded-full bg-black bg-opacity-5"
          >
            <i class="material-icons text-lg text-red-700">delete</i>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "@/plugins/firebase";
import firebase from "firebase/compat/app";

export default {
  name: "RestaurantEditCard",
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    shopOwner: {
      type: Object,
      required: true,
    },
    restaurantid: {
      type: String,
      required: true,
    },
    numberOfMenus: {
      type: Number,
      required: true,
    },
    numberOfOrders: {
      type: Number,
      required: true,
    },
    lineEnable: {
      type: Boolean,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    isOwner: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      host: location.protocol + "//" + location.host,
      share_url:
        location.protocol + "//" + location.host + "/r/" + this.restaurantid,
      requestState: 0,
      detacher: null,
    };
  },
  mounted() {
    this.detacher = db
      .doc(`requestList/${this.restaurantid}`)
      .onSnapshot(async (result) => {
        if (result.exists) {
          this.requestState = result.data().status;
        } else {
          this.requestState = 0;
        }
      });
  },
  destroyed() {
    this.detacher && this.detacher();
  },
  methods: {
    deleteRestaurant() {
      console.log("deleteRestaurant");
      this.$store.commit("setAlert", {
        title: this.shopInfo.restaurantName,
        code: "editRestaurant.reallyDelete",
        callback: async () => {
          console.log(this.restaurantid);
          this.$emit("deleteFromRestaurantLists", this.restaurantid);

          db.doc(`restaurants/${this.restaurantid}`).update(
            "deletedFlag",
            true
          );
        },
      });
    },
    deleteFromList() {
      this.$store.commit("setAlert", {
        code: "editRestaurant.reallyOnListDelete",
        callback: () => {
          console.log(this.restaurantid);
          db.doc(`restaurants/${this.restaurantid}`).update("onTheList", false);
        },
      });
    },
    requestList() {
      db.doc(`requestList/${this.restaurantid}`).set({
        status: 1,
        uid: this.$store.getters.uidAdmin,
        created: firebase.firestore.FieldValue.serverTimestamp(),
      });
    },
    requestDelete() {
      db.doc(`requestList/${this.restaurantid}`).delete();
    },
    positionUp() {
      this.$emit("positionUp", this.restaurantid);
    },
    positionDown() {
      this.$emit("positionDown", this.restaurantid);
    },
  },
};
</script>
