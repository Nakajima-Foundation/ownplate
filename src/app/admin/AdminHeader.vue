<template>
  <div>
    <div class="flex space-x-4">
      <div class="flex-shrink-0">
        <back-button :url="backLink" />
      </div>
      <PreviewLink :shopInfo="shopInfo" :isInMo="isInMo" :moPrefix="moPrefix" />
    </div>

    <!-- Photo and Name -->
    <div class="mt-4 lg:mx-4 lg:mt-0 lg:flex lg:flex-1 lg:items-center">
      <div class="flex items-center">
        <div class="mr-4 flex-shrink-0 rounded-full bg-black bg-opacity-10">
          <img
            :src="resizedProfileImage(shopInfo, '600')"
            class="h-9 w-9 rounded-full object-cover"
          />
        </div>
        <div class="text-base font-bold">
          {{ shopInfo.restaurantName }}
        </div>
      </div>
    </div>

    <div class="mt-4 flex space-x-2 lg:mt-0">
      <!-- Suspend Button -->
      <template v-if="!isInMo">
        <o-button
          tag="router-link"
          :to="`/admin/restaurants/${restaurantId()}/suspend`"
          class="b-reset-tw"
          v-if="showSuspend"
        >
          <div
            v-if="suspendUntil"
            class="inline-flex h-9 items-center justify-center rounded-full bg-red-700 bg-opacity-5 px-4"
          >
            <i class="material-icons mr-2 text-lg text-red-700"
              >remove_shopping_cart</i
            >
            <div class="text-sm font-bold text-red-700">
              {{ $t("admin.order.suspending") }}
            </div>
          </div>

          <div
            v-else
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons mr-2 text-lg text-op-teal"
              >remove_shopping_cart</i
            >
            <div class="text-sm font-bold text-op-teal">
              {{ $t("admin.order.suspendSettings") }}
            </div>
          </div>
        </o-button>
      </template>
      <template v-else>
        <!-- for mo suspend -->
        <!-- ToDo 受付休止(全ての注文)は以下表示 -->
        <div
          v-if="false"
          class="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-red-700 bg-opacity-5 px-4"
          @click="openMoSuspendOnModal"
        >
          <i class="material-icons mr-2 text-lg text-red-700"
            >remove_shopping_cart</i
          >
          <div class="text-sm font-bold text-red-700">
            {{ $t("mobileOrder.admin.suspending") }}
          </div>
        </div>

        <!-- ToDo ピックアップ休止は以下表示 -->
        <div
          v-if="false"
          class="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-red-700 bg-opacity-5 px-4 pr-3"
          @click="openMoSuspendOnModal"
        >
          <i class="material-icons mr-2 text-lg text-red-700"
            >remove_shopping_cart</i
          >
          <div class="text-xs font-bold tracking-tight text-red-700 sm:text-sm">
            {{ $t("mobileOrder.admin.suspendingPickup") }}
          </div>
        </div>

        <div
          v-else
          class="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          @click="openMoSuspendOffModal"
        >
          <i class="material-icons mr-2 text-lg text-op-teal"
            >remove_shopping_cart</i
          >
          <div class="text-sm font-bold text-op-teal">
            {{ $t("mobileOrder.admin.suspendSettings") }}
          </div>
        </div>
      </template>
      <!-- Notifications -->
      <div>
        <notification-index :shopInfo="shopInfo" />
      </div>
    </div>
    <o-modal :active.sync="isOpenMoSuspendOffModal" :width="488">
      <div class="mx-2 my-6 rounded-lg bg-white p-6 shadow-lg">
        <div class="text-xl font-bold text-black text-opacity-40">
          {{ $t("mobileOrder.admin.suspendSettings") }}
        </div>
        <div class="mt-6 font-bold text-black text-opacity-60">
          {{ $t("mobileOrder.admin.suspendConfirm") }}
        </div>
        <div
          class="mx-4 mt-8 flex flex-col space-y-6 text-sm font-bold text-black text-opacity-60"
        >
          <!-- ToDo以下2つのオプションがラジオボタンで選択できるようにする-->
          <div>{{ $t("mobileOrder.admin.suspendAll") }}</div>
          <div>{{ $t("mobileOrder.admin.suspendPickup") }}</div>
        </div>

        <div class="mt-10 flex items-center justify-center space-x-4">
          <!-- ToDoキャンセルボタンでダイアログを閉じる-->
          <div
            class="inline-flex h-12 w-32 items-center justify-center rounded-full bg-black bg-opacity-5"
          >
            <span class="text-base font-bold text-black text-opacity-60">
              {{ $t("mobileOrder.admin.cancel") }}
            </span>
          </div>
          <!-- ToDo休止ボタンで休止する-->
          <div
            class="inline-flex h-12 w-32 items-center justify-center rounded-full bg-op-teal shadow"
          >
            <span class="text-base font-bold text-white">
              {{ $t("mobileOrder.admin.suspend") }}
            </span>
          </div>
        </div>
      </div>
    </o-modal>

    <o-modal :active.sync="isOpenMoSuspendOnModal" :width="488">
      <div class="mx-2 my-6 rounded-lg bg-white p-6 shadow-lg">
        <!-- ToDo全ての注文受付を再開する場合は以下確認メッセージを表示-->
        <div class="font-bold text-black text-opacity-60">
          {{ $t("mobileOrder.admin.restoreConfirm") }}
        </div>

        <!-- ToDoピックアップ注文受付を再開する場合は以下確認メッセージを表示-->
        <div class="font-bold text-black text-opacity-60">
          {{ $t("mobileOrder.admin.restorePickupConfirm") }}
        </div>

        <div class="mt-10 flex items-center justify-center space-x-4">
          <!-- ToDoキャンセルボタンでダイアログを閉じる-->
          <div
            class="inline-flex h-12 w-32 items-center justify-center rounded-full bg-black bg-opacity-5"
          >
            <span class="text-base font-bold text-black text-opacity-60">
              {{ $t("mobileOrder.admin.cancel") }}
            </span>
          </div>
          <!-- ToDo再開ボタンで休止する-->
          <div
            class="inline-flex h-12 w-32 items-center justify-center rounded-full bg-op-teal shadow"
          >
            <span class="text-base font-bold text-white">
              {{ $t("mobileOrder.admin.Restore") }}
            </span>
          </div>
        </div>
      </div>
    </o-modal>
  </div>
</template>

<script>
import { defineComponent, computed, ref } from "@vue/composition-api";
import BackButton from "@/components/BackButton.vue";
import NotificationIndex from "./Notifications/Index.vue";
import PreviewLink from "@/app/admin/common/PreviewLink.vue";

export default defineComponent({
  components: {
    BackButton,
    NotificationIndex,
    PreviewLink,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    backLink: {
      type: String,
      required: true,
    },
    showSuspend: {
      type: Boolean,
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
    const suspendUntil = computed(() => {
      if (props.shopInfo.suspendUntil) {
        const time = props.shopInfo.suspendUntil.toDate();
        if (time < new Date()) {
          return false;
        }
        return true;
      }
      return false;
    });

    // for mo
    const isOpenMoSuspendOnModal = ref(false);
    const openMoSuspendOnModal = () => {
      isOpenMoSuspendOnModal.value = true;
    };
    const isOpenMoSuspendOffModal = ref(false);
    const openMoSuspendOffModal = () => {
      isOpenMoSuspendOffModal.value = true;
    };
    return {
      suspendUntil,

      isOpenMoSuspendOnModal,
      openMoSuspendOnModal,

      isOpenMoSuspendOffModal,
      openMoSuspendOffModal,
    };
  },
});
</script>
