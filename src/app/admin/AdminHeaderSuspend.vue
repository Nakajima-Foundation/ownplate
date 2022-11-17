<template>
  <div>
    <!-- ToDo 受付休止(全ての注文)は以下表示 -->
    <div
      v-if="shopInfo.isSuspendAllOrder"
      class="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-red-700 bg-opacity-5 px-4"
      @click="toggleMoSuspendOnModal"
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
      v-else-if="shopInfo.isSuspendPickup"
      class="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-red-700 bg-opacity-5 px-4 pr-3"
      @click="toggleMoSuspendOnModal"
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
      @click="toggleMoSuspendOffModal"
    >
      <i class="material-icons mr-2 text-lg text-op-teal"
        >remove_shopping_cart</i
      >
      <div class="text-sm font-bold text-op-teal">
        {{ $t("mobileOrder.admin.suspendSettings") }}
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
          <o-radio
            v-model="suspendSelect"
            :native-value="1"
            :key="1"
            >
            <div>{{ $t("mobileOrder.admin.suspendAll") }}</div>
          </o-radio>
          <o-radio
            v-model="suspendSelect"
            :native-value="2"
            :key="2"
            >
            <div>{{ $t("mobileOrder.admin.suspendPickup") }}</div>
          </o-radio>
        </div>

        <div class="mt-10 flex items-center justify-center space-x-4">
          <!-- ToDoキャンセルボタンでダイアログを閉じる-->
          <div
            class="inline-flex h-12 w-32 items-center justify-center rounded-full bg-black bg-opacity-5 cursor-pointer"
            @click="toggleMoSuspendOffModal"
          >
            <span class="text-base font-bold text-black text-opacity-60">
              {{ $t("mobileOrder.admin.cancel") }}
            </span>
          </div>
          <!-- ToDo休止ボタンで休止する-->
          <div
            class="inline-flex h-12 w-32 items-center justify-center rounded-full bg-op-teal shadow cursor-pointer"
            @click="updateSuspend"
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
        <div class="font-bold text-black text-opacity-60"
             v-if="shopInfo.isSuspendAllOrder" 
             >
          {{ $t("mobileOrder.admin.restoreConfirm") }}
        </div>

        <!-- ToDoピックアップ注文受付を再開する場合は以下確認メッセージを表示-->
        <div class="font-bold text-black text-opacity-60"
             v-else
             >
          {{ $t("mobileOrder.admin.restorePickupConfirm") }}
        </div>

        <div class="mt-10 flex items-center justify-center space-x-4">
          <!-- ToDoキャンセルボタンでダイアログを閉じる-->
          <div
            class="inline-flex h-12 w-32 items-center justify-center rounded-full bg-black bg-opacity-5 cursor-pointer"
            @click="toggleMoSuspendOnModal"
            >
            <span class="text-base font-bold text-black text-opacity-60">
              {{ $t("mobileOrder.admin.cancel") }}
            </span>
          </div>
          <!-- ToDo再開ボタンで休止する-->
          <div
            class="inline-flex h-12 w-32 items-center justify-center rounded-full bg-op-teal shadow cursor-pointer"
            @click="resetSuspend"
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
import { db } from "@/lib/firebase/firebase9";
import { doc, updateDoc } from "firebase/firestore";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  setup(props, ctx) {
    console.log(props.shopInfo);
    const suspendSelect = ref(1);
    // for mo
    const isOpenMoSuspendOnModal = ref(false);
    const toggleMoSuspendOnModal = () => {
      isOpenMoSuspendOnModal.value = !isOpenMoSuspendOnModal.value;
    };
    const isOpenMoSuspendOffModal = ref(false);
    const toggleMoSuspendOffModal = () => {
      isOpenMoSuspendOffModal.value = !isOpenMoSuspendOffModal.value;
    };

    const resetSuspend = () => {
      updateDoc(
        doc(db, `restaurants/${ctx.root.restaurantId()}`),
        {
          isSuspendAllOrder: false,
          isSuspendPickup: false,
        }
      );
      toggleMoSuspendOnModal();
    }
    const updateSuspend = () => {
      if (Number(suspendSelect.value) === 1) {
        updateDoc(
          doc(db, `restaurants/${ctx.root.restaurantId()}`),
          {isSuspendAllOrder: true}
        );
      } else if (Number(suspendSelect.value) === 2) {
        updateDoc(
          doc(db, `restaurants/${ctx.root.restaurantId()}`),
          {isSuspendPickup: true}
        );
      }

      toggleMoSuspendOffModal();
    };
    return {
      suspendSelect,
      isOpenMoSuspendOnModal,
      toggleMoSuspendOnModal,

      isOpenMoSuspendOffModal,
      toggleMoSuspendOffModal,

      updateSuspend,
      resetSuspend,
    };
  },
});
</script>
