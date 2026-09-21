<template>
  <div>
    <div v-if="notFound == null"></div>
    <div v-else-if="notFound == true">
      <NotFound />
    </div>
    <div v-else>
      <!-- Header -->
      <AdminHeader
        class="mx-6 mt-4 lg:flex lg:items-center"
        :shopInfo="shopInfo"
        :showSuspend="false"
        backLink="/admin/restaurants"
      />

      <!-- Body -->
      <div class="grid-col-1 mx-6 mt-4 space-y-4 lg:mx-auto lg:max-w-2xl">
        <!-- Title -->
        <div v-if="devices.length > 0" class="text-xl font-bold text-black/30">
          {{ $t("admin.push.devices") }}
        </div>

        <!-- Devices -->
        <div class="mt-2 grid grid-cols-1 space-y-2">
          <div
            v-for="device in devices"
            :key="device.id"
            class="flex items-center"
          >
            <!-- Device Name -->
            <button
              type="button"
              class="flex-1 cursor-pointer rounded-lg bg-white p-4 text-left shadow-sm"
              :aria-pressed="!!device.notify"
              :class="device.notify ? 'text-green-600' : 'text-black/30'"
              @click="handleToggle(device)"
            >
              <div class="flex items-center">
                <i class="material-icons mr-2 text-2xl">{{
                  device.notify ? "check_box" : "check_box_outline_blank"
                }}</i>
                <div class="text-base font-bold">
                  {{ device.name }}
                </div>
              </div>
            </button>

            <!-- Delete -->
            <div>
              <button
                type="button"
                class="ml-4 inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-black/5 px-4"
                @click.stop="handleDelete(device.id)"
              >
                <i class="material-icons text-lg text-red-700">delete</i>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-if="devices.length === 0" class="rounded-lg bg-black/5 p-4">
          <span class="text-sm text-black/60">
            {{ $t("admin.push.empty") }}
          </span>
        </div>

        <!-- Add Device -->
        <div class="mt-4 text-center">
          <button
            type="button"
            class="cursor-pointer"
            :disabled="creating"
            @click="handleCreateInvite"
          >
            <div
              class="bg-op-teal inline-flex h-12 items-center justify-center rounded-full px-6"
              :class="creating ? 'opacity-50' : ''"
            >
              <i class="material-icons mr-2 text-2xl text-white"
                >add_to_home_screen</i
              >
              <div class="text-base font-bold text-white">
                {{ $t("admin.push.addDevice") }}
              </div>
            </div>
          </button>
        </div>

        <!-- Invite -->
        <div v-if="inviteUrl" class="mt-4 rounded-lg bg-white p-4 shadow-sm">
          <div class="text-sm font-bold text-black/60">
            {{ $t("admin.push.inviteHeading") }}
          </div>
          <div class="mt-2 text-xs text-black/60">
            {{ $t("admin.push.inviteHint") }}
          </div>
          <div class="mt-4 flex justify-center">
            <vue-qrcode :value="inviteUrl" :options="{ width: 180 }" />
          </div>
          <div class="mt-4 rounded bg-black/5 p-2 text-xs break-all">
            {{ inviteUrl }}
          </div>
          <div class="mt-2 text-center">
            <button
              type="button"
              class="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-black/5 px-4"
              @click="handleCopy"
            >
              <span class="text-op-teal text-sm font-bold">
                {{ copied ? $t("admin.push.copied") : $t("admin.push.copy") }}
              </span>
            </button>
          </div>
        </div>

        <!-- Test -->
        <div v-if="devices.length > 0" class="mt-4 text-center">
          <button
            type="button"
            class="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-black/5 px-4"
            @click="handleTest"
          >
            <span class="text-op-teal text-sm font-bold">
              {{ $t("admin.push.test") }}
            </span>
          </button>
          <div v-if="testResult" class="mt-2 text-xs text-black/60">
            {{ testResult }}
          </div>
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
  updateDoc,
  deleteDoc,
  onSnapshot,
  collection,
} from "firebase/firestore";

import { createPushInvite, sendTestWebPush } from "@/lib/firebase/functions";
import { checkShopAccount } from "@/utils/userPermission";
import { describeSendResult } from "@/utils/pushFormat";
import {
  useAdminUids,
  useRestaurantId,
  notFoundResponse,
  defaultTitle,
} from "@/utils/utils";

import NotFound from "@/components/NotFound.vue";
import AdminHeader from "@/app/admin/AdminHeader.vue";

import { useDialogStore } from "@/store/dialog";
import { useHead } from "@unhead/vue";

type PushDeviceData = {
  id: string;
  name?: string;
  notify?: boolean;
};

export default defineComponent({
  components: {
    AdminHeader,
    NotFound,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const dialogStore = useDialogStore();

    useHead(() => ({
      title: ["Admin Manage Push", defaultTitle].join(" / "),
    }));

    const { ownerUid } = useAdminUids();
    if (!checkShopAccount(props.shopInfo, ownerUid.value)) {
      return notFoundResponse;
    }
    const restaurantId = useRestaurantId();

    const devices = ref<PushDeviceData[]>([]);
    const inviteUrl = ref("");
    const creating = ref(false);
    const copied = ref(false);
    const testResult = ref("");

    const detacher = onSnapshot(
      collection(db, `restaurants/${restaurantId.value}/pushRegistrations`),
      (snapshot) => {
        devices.value = snapshot.docs.map((myDoc) => {
          return { ...myDoc.data(), id: myDoc.id };
        });
      },
    );
    onUnmounted(() => {
      detacher();
    });

    const handleToggle = async (device: PushDeviceData) => {
      await updateDoc(
        doc(
          db,
          `restaurants/${restaurantId.value}/pushRegistrations/${device.id}`,
        ),
        { notify: !device.notify },
      );
    };

    const handleDelete = (fid: string) => {
      dialogStore.setAlert({
        code: "admin.push.deleteConfirm",
        callback: async () => {
          await deleteDoc(
            doc(
              db,
              `restaurants/${restaurantId.value}/pushRegistrations/${fid}`,
            ),
          );
        },
      });
    };

    // URL は作った直後にしか見えない。サーバはハッシュしか持たないので、
    // 閉じたら作り直してもらう。
    const handleCreateInvite = async () => {
      if (creating.value) {
        return;
      }
      creating.value = true;
      copied.value = false;
      try {
        const { data } = await createPushInvite({
          restaurantId: restaurantId.value,
        });
        inviteUrl.value = data.url;
      } catch (e) {
        console.error("failed to create a push invite", e);
        inviteUrl.value = "";
      }
      creating.value = false;
    };

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(inviteUrl.value);
        copied.value = true;
      } catch (e) {
        console.error("failed to copy the invite url", e);
      }
    };

    const handleTest = async () => {
      testResult.value = "";
      try {
        const { data } = await sendTestWebPush({
          restaurantId: restaurantId.value,
          title: "テスト通知",
          body: props.shopInfo.restaurantName,
        });
        testResult.value = describeSendResult(data.sent, data.targets);
      } catch (e) {
        testResult.value = `${e}`;
      }
    };

    return {
      notFound: false,
      devices,
      inviteUrl,
      creating,
      copied,
      testResult,
      handleToggle,
      handleDelete,
      handleCreateInvite,
      handleCopy,
      handleTest,
    };
  },
});
</script>
