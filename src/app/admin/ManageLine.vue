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
        :backLink="`/admin/restaurants/${shopInfo.restaurantId}/orders`"
        :showSuspend="false"
        :isInMo="isInMo"
        :moPrefix="moPrefix"
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

<script>
import { defineComponent, ref, onUnmounted } from "vue";
import { db } from "@/plugins/firebase";

import { lineAuthURL, lineVerify } from "@/lib/line/line";
import { checkShopAccount } from "@/utils/userPermission";
import { useAdminUids, getRestaurantId, notFoundResponse } from "@/utils/utils";

import NotFound from "@/components/NotFound.vue";
import AdminHeader from "@/app/admin/AdminHeader.vue";

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
    const lineUsers = ref([]);

    const { ownerUid, uid } = useAdminUids(ctx);
    if (!checkShopAccount(props.shopInfo, ownerUid.value)) {
      return notFoundResponse;
    }
    const restaurantId = getRestaurantId(ctx.root);

    const lineId = ctx.root.$route.query.userId;
    const displayName = ctx.root.$route.query.displayName;
    const state = ctx.root.$route.query.state;
    if (lineId && displayName && state) {
      if (lineVerify(state)) {
        db.doc(`restaurants/${restaurantId}/lines/${lineId}`)
          .set(
            {
              displayName,
              notify: true,
              uid: uid.value,
              restaurantId: restaurantId,
            },
            { merge: true }
          )
          .then(() => {
            console.log("registered lineId", lineId);
          });
      } else {
        console.error("invalid state", state);
      }
      ctx.root.$router.replace(location.pathname);
    }
    const detacher = db
      .collection(`restaurants/${restaurantId}/lines`)
      .onSnapshot((snapshot) => {
        lineUsers.value = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
          };
        });
      });
    onUnmounted(() => {
      detacher();
    });

    const handleToggle = async (lineUser) => {
      await db.doc(`restaurants/${restaurantId}/lines/${lineUser.id}`).update({
        notify: !lineUser.notify,
      });
    };
    const handleLineAuth = () => {
      const url = lineAuthURL("/callback/line", {
        pathname: location.pathname,
      });
      location.href = url;
    };
    const handleDelete = (lineId) => {
      ctx.root.$store.commit("setAlert", {
        code: "admin.order.lineDelete",
        callback: async () => {
          console.log("handleDelete", lineId);
          await db.doc(`restaurants/${restaurantId}/lines/${lineId}`).delete();
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
