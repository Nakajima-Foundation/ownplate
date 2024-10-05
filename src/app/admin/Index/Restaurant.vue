<template>
  <div>
    <div class="mb-2 rounded-lg bg-white p-4 shadow">
      <!-- Restaurant Name -->
      <div class="inline-flex items-center justify-center text-lg font-bold">
        <span>{{
          shopInfo.restaurantName || $t("editRestaurant.noRestaurant")
        }}</span>
        <i
          class="material-icons text-xl text-op-teal"
          v-if="shopInfo.enableDelivery"
        >
          delivery_dining
        </i>
      </div>

      <!-- Restaurant Photo and Details -->
      <div class="mt-4 flex items-center justify-center space-x-4">
        <div class="flex-shrink-0">
          <img
            class="h-20 w-20 rounded-full object-cover"
            :src="
              resizedProfileImage(shopInfo, '600') ||
              '/OwnPlate-Favicon-Default.png'
            "
          />
        </div>

        <div>
          <div>
            <router-link :to="previewLink">
              <div
                class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
              >
                <i class="material-icons mr-2 text-lg text-op-teal">launch</i>
                <span class="text-sm font-bold text-op-teal">{{
                  $t("admin.viewPage")
                }}</span>
              </div>
            </router-link>
          </div>
          <div class="mt-2" v-if="isOwner">
            <router-link :to="'/admin/restaurants/' + restaurantid">
              <div
                class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
              >
                <i class="material-icons mr-2 text-lg text-op-teal">edit</i>
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
            class="rounded-md bg-red-700 bg-opacity-10 px-4 py-2 text-sm font-bold text-red-700"
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
            class="inline-flex h-16 w-full items-center justify-center rounded-full px-8 shadow"
            :class="numberOfOrders > 0 ? 'bg-yellow-500' : 'bg-op-teal'"
          >
            <span class="text-lg font-bold text-white">
              {{ $t("admin.viewOrders") }}</span
            ><span
              class="ml-4 rounded-full bg-white bg-opacity-20 px-3 py-2 text-sm font-bold text-white"
              >{{
                $t(
                  "admin.incompleteOrders",
                  {
                    count: numberOfOrders,
                  },
                  numberOfOrders,
                )
              }}</span
            >
          </div>
        </router-link>
      </div>

      <!-- Edit Menu -->
      <div class="mt-4 px-4 text-center">
        <!-- Menu Not Existing -->
        <div v-if="numberOfMenus == 0">
          <router-link :to="'/admin/restaurants/' + restaurantid + '/menus'">
            <div
              class="inline-flex h-12 w-full items-center justify-center rounded-full border-2 border-solid border-red-700 px-6"
            >
              <span class="text-base font-bold text-red-700">
                {{ $t("admin.editMenuItems") }}</span
              >
              <span
                class="ml-2 rounded-full bg-red-700 bg-opacity-10 px-2 text-base font-bold text-red-700"
                >{{ numberOfMenus }}</span
              >
            </div>
          </router-link>
          <div class="mt-2 text-sm font-bold text-red-700">
            {{ $t("admin.pleaseAddMenu") }}
          </div>
        </div>

        <!-- Menu Existing -->
        <div v-else>
          <router-link :to="'/admin/restaurants/' + restaurantid + '/menus'">
            <div
              class="inline-flex h-12 w-full items-center justify-center rounded-full border-2 border-solid border-op-teal px-6"
            >
              <span class="text-base font-bold text-op-teal">
                {{ $t("admin.editMenuItems") }}</span
              >
              <span
                class="ml-2 rounded-full bg-black bg-opacity-5 px-2 text-base font-bold"
                >{{ numberOfMenus }}</span
              >
            </div>
          </router-link>
        </div>
      </div>

      <!-- Notifications Settings -->
      <div
        class="mt-4 flex justify-evenly rounded-lg bg-black bg-opacity-5 pt-3 pb-2 text-center"
        v-if="isOwner && !simpleMode"
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

        <router-link :to="'/admin/restaurants/' + restaurantid + '/linelist'">
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

      <!-- Delivery and Printer and Discount -->
      <div
        class="mt-4 flex items-center justify-center space-x-4"
        v-if="!simpleMode && isOwner"
      >
        <div>
          <router-link :to="`/admin/restaurants/${restaurantid}/delivery`">
            <div
              class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons mr-2 text-lg text-op-teal"
                >delivery_dining</i
              >
              <span class="text-sm font-bold text-op-teal">{{
                $t("admin.menu.delivery")
              }}</span>
            </div>
          </router-link>
        </div>
        <div>
          <router-link :to="`/admin/restaurants/${restaurantid}/printer`">
            <div
              class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons mr-2 text-lg text-op-teal">print</i>
              <span class="text-sm font-bold text-op-teal">{{
                $t("admin.menu.printer")
              }}</span>
            </div>
          </router-link>
        </div>

        <div v-if="isOwner">
          <router-link :to="`/admin/restaurants/${restaurantid}/discounts`">
            <div
              class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons mr-2 text-lg text-op-teal">sell</i>
              <span class="text-sm font-bold text-op-teal">{{
                $t("admin.menu.discount")
              }}</span>
            </div>
          </router-link>
        </div>
      </div>

      <!-- QR Code and Monthly Report -->

      <div
        class="mt-4 flex items-center justify-center space-x-4"
        v-if="!simpleMode"
      >
        <div>
          <router-link :to="`/admin/restaurants/${restaurantid}/line`">
            <div
              class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
            >
              <i class="fab fa-line mr-2 text-lg text-op-teal" />
              <span class="text-sm font-bold text-op-teal">{{
                $t("admin.line.title")
              }}</span>
            </div>
          </router-link>
        </div>

        <div v-if="isOwner">
          <router-link :to="`/admin/restaurants/${restaurantid}/report`">
            <div
              class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons mr-2 text-lg text-op-teal"
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
      <div v-if="isOwner && !simpleMode">
        <!-- On Directory -->
        <div v-if="shopInfo.onTheList" class="mt-4 text-center">
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
              class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
            >
              <span class="text-sm font-bold text-op-teal">{{
                $t("admin.directory.unlist")
              }}</span>
            </a>
          </div>
        </div>

        <!-- Requested -->
        <div v-else-if="requestState == 1" class="mt-4 text-center">
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
              class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
            >
              <span class="text-sm font-bold text-red-700">{{
                $t("admin.directory.cancelRequest")
              }}</span>
            </a>
          </div>
          <div class="mt-2">
            <span class="text-sm">
              {{ $t("admin.directory.requestingWarning") }}
            </span>
          </div>
        </div>

        <!-- Off Directory -->
        <div v-else class="mt-4 text-center">
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
              class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
            >
              <span class="text-sm font-bold text-op-teal">
                {{ $t("admin.directory.requestList") }}</span
              >
            </a>
          </div>
          <div class="mt-2">
            <span class="text-sm">
              {{ $t("admin.directory.requestWarning") }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Sort and Delete -->
    <div
      class="mt-2 flex justify-end space-x-2 pb-2"
      v-if="isOwner && !simpleMode"
    >
      <!-- Up -->
      <div>
        <template v-if="position !== 'first'">
          <button @click="positionUp" class="b-reset-tw">
            <div
              class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons text-lg text-op-teal">arrow_upward</i>
            </div>
          </button>
        </template>

        <template v-else>
          <button disabled class="b-reset-tw">
            <div
              class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons text-lg text-op-teal">arrow_upward</i>
            </div>
          </button>
        </template>
      </div>

      <!-- Down -->
      <div>
        <template v-if="position !== 'last'">
          <button @click="positionDown" class="b-reset-tw">
            <div
              class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons text-lg text-op-teal">arrow_downward</i>
            </div>
          </button>
        </template>

        <template v-else>
          <button disabled class="b-reset-tw">
            <div
              class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons text-lg text-op-teal">arrow_downward</i>
            </div>
          </button>
        </template>
      </div>

      <!-- Delete -->
      <div>
        <button @click="deleteRestaurant" class="b-reset-tw">
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-red-700">delete</i>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed } from "vue";
import { db } from "@/lib/firebase/firebase9";
import {
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
} from "firebase/firestore";

import { useStore } from "vuex";

import { resizedProfileImage, isDev } from "@/utils/utils";

export default defineComponent({
  name: "RestaurantEditCard",
  props: {
    shopInfo: {
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
    simpleMode: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["positionUp", "positionDown", "deleteFromRestaurantLists"],
  setup(props, ctx) {
    const store = useStore();

    const requestState = ref(0);
    let detacher: null | Unsubscribe = null;

    onMounted(() => {
      if (props.isOwner) {
        detacher = onSnapshot(
          doc(db, `requestList/${props.restaurantid}`),
          (result) => {
            if (result.exists()) {
              requestState.value = result.data().status;
            } else {
              requestState.value = 0;
            }
          },
        );
      }
    });
    onUnmounted(() => {
      detacher && detacher();
    });

    const deleteRestaurant = () => {
      store.commit("setAlert", {
        title: props.shopInfo.restaurantName,
        code: "editRestaurant.reallyDelete",
        callback: () => {
          ctx.emit("deleteFromRestaurantLists", props.restaurantid);

          updateDoc(doc(db, `restaurants/${props.restaurantid}`), {
            deletedFlag: true,
          });
        },
      });
    };
    const deleteFromList = () => {
      store.commit("setAlert", {
        code: "editRestaurant.reallyOnListDelete",
        callback: () => {
          updateDoc(doc(db, `restaurants/${props.restaurantid}`), {
            onTheList: false,
          });
        },
      });
    };
    const requestList = () => {
      setDoc(doc(db, `requestList/${props.restaurantid}`), {
        status: 1,
        uid: store.getters.uidAdmin,
        created: serverTimestamp(),
      });
    };
    const requestDelete = () => {
      deleteDoc(doc(db, `requestList/${props.restaurantid}`));
    };
    const positionUp = () => {
      ctx.emit("positionUp", props.restaurantid);
    };
    const positionDown = () => {
      ctx.emit("positionDown", props.restaurantid);
    };
    const previewLink = computed(() => {
      return "/r/" + props.restaurantid;
    });
    return {
      requestState,

      previewLink,
      isDev,

      deleteRestaurant,
      deleteFromList,
      requestList,
      requestDelete,
      positionUp,
      positionDown,
      resizedProfileImage,
    };
  },
});
</script>
