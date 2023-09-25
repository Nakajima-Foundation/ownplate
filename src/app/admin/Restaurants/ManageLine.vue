<template>
  <div>
    <div v-if="notFound == null"></div>
    <div v-else-if="notFound == true">
      <NotFound />
    </div>
    <div v-else>
      <!-- Header -->
      <AdminHeader
        class="mx-6 mt-6 lg:flex lg:items-center"
        :shopInfo="shopInfo"
        :showSuspend="false"
      />

      <!-- Body -->
      <div class="grid-col-1 mx-6 mt-6 space-y-4 lg:mx-auto lg:max-w-2xl">
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
              class="flex-1 cursor-pointer rounded-lg bg-white p-4 shadow"
              @click="handleToggle(lineUser)"
              :class="
                lineUser.notify
                  ? 'text-green-600'
                  : 'text-black text-opacity-30'
              "
            >
              <!-- Checkbox UI -->
              <div class="flex items-center">
                <i class="material-icons mr-2 text-2xl">{{
                  lineUser.notify ? "check_box" : "check_box_outline_blank"
                }}</i>
                <div class="text-base font-bold">
                  {{ lineUser.displayName }}
                </div>
              </div>
            </div>

            <!-- Delete -->
            <div>
              <a
                class="ml-4 inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
                @click.stop="handleDelete(lineUser.id)"
              >
                <i class="material-icons text-lg text-red-700">delete</i>
              </a>
            </div>
          </div>
        </div>

        <!-- Add LINE User -->
        <div class="mt-6 text-center">
          <o-button @click="handleLineAuth" class="b-reset-tw">
            <div
              class="inline-flex h-12 items-center justify-center rounded-full px-6"
              style="background: #18b900"
            >
              <i class="fab fa-line mr-2 text-2xl text-white" />
              <div class="text-base font-bold text-white">
                {{ $t("admin.order.lineAdd") }}
              </div>
            </div>
          </o-button>
        </div>

        <!-- Note for Safari Private Browsing Mode -->
        <div class="mt-6 rounded-lg bg-black bg-opacity-5 p-4">
          <span class="text-xs text-black opacity-60">
            {{ $t("admin.order.lineSafariPrivate") }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onUnmounted } from "vue";
import { db } from "@/lib/firebase/firebase9";
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  collection,
} from "firebase/firestore";

import { lineAuthURL, lineVerify } from "@/lib/line/line";
import { checkShopAccount } from "@/utils/userPermission";
import { useAdminUids, useRestaurantId, notFoundResponse } from "@/utils/utils";

import NotFound from "@/components/NotFound.vue";
import AdminHeader from "@/app/admin/AdminHeader.vue";

import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";

interface LineUserData {
  id: string;
  notify?: boolean;
}

export default defineComponent({
  components: {
    AdminHeader,
    NotFound,
  },
  metaInfo() {
    return {
      title: ["Admin Manage Line", this.defaultTitle].join(" / "),
    };
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    const lineUsers = ref<LineUserData[]>([]);

    const { ownerUid, uid } = useAdminUids();
    if (!checkShopAccount(props.shopInfo, ownerUid.value)) {
      return notFoundResponse;
    }
    const restaurantId = useRestaurantId();

    const lineId = route.query.userId;
    const displayName = route.query.displayName;
    const state = route.query.state as string;
    if (lineId && displayName && state) {
      if (lineVerify(state)) {
        console.log(displayName, uid.value, restaurantId.value);
        setDoc(
          doc(db, `restaurants/${restaurantId.value}/lines/${lineId}`),
          {
            displayName,
            notify: true,
            uid: uid.value,
            restaurantId: restaurantId.value,
          },
          { merge: true },
        ).then(() => {
          console.log("registered lineId", lineId);
        });
      } else {
        console.error("invalid state", state);
      }
      router.replace(location.pathname);
    }
    const detacher = onSnapshot(
      collection(db, `restaurants/${restaurantId.value}/lines`),
      (snapshot) => {
        lineUsers.value = snapshot.docs.map((myDoc) => {
          const data = myDoc.data();
          return {
            ...data,
            id: myDoc.id,
          };
        });
      },
    );
    onUnmounted(() => {
      detacher();
    });

    const handleToggle = async (lineUser: LineUserData) => {
      await updateDoc(
        doc(db, `restaurants/${restaurantId.value}/lines/${lineUser.id}`),
        {
          notify: !lineUser.notify,
        },
      );
    };
    const handleLineAuth = () => {
      const url = lineAuthURL("/callback/line", {
        pathname: location.pathname,
      });
      location.href = url;
    };
    const handleDelete = (lineId: string) => {
      store.commit("setAlert", {
        code: "admin.order.lineDelete",
        callback: async () => {
          console.log("handleDelete", lineId);
          await deleteDoc(
            doc(db, `restaurants/${restaurantId.value}/lines/${lineId}`),
          );
        },
      });
    };
    return {
      notFound: false,
      lineUsers,
      handleToggle,
      handleLineAuth,
      handleDelete,
    };
  },
});
</script>
