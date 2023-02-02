<template>
  <div>
    <!-- ToDo 受付休止(全ての注文)は以下表示 -->
    <div
      v-if="isSuspendAllOrder || isSuspendPickup"
      @click="toggleMoSuspendOnModal"
    >
      <MoSuspendButton
        v-if="!isAllShop"
        :positive="false"
        :class="isSuspendPickup ? 'pr-3' : ''"
      >
        {{
          $t(
            isSuspendAllOrder
              ? "mobileOrder.admin.suspending"
              : "mobileOrder.admin.suspendingPickup"
          )
        }}
      </MoSuspendButton>
      <div
        v-else
        class="flex h-14 items-center justify-center rounded-full bg-red-700 bg-opacity-5 px-4 text-red-700"
      >
        <i class="material-icons mr-2 text-lg">remove_shopping_cart</i>
        <span class="text-sm font-bold">
          {{
            $t(
              isSuspendAllOrder
                ? "mobileOrder.admin.suspending"
                : "mobileOrder.admin.suspendingPickup"
            )
          }}{{ $t("mobileOrder.admin.suspendAllStore") }}</span
        >
      </div>
    </div>
    <div v-else @click="toggleMoSuspendOffModal">
      <MoSuspendButton v-if="!isAllShop" :positive="true">
        {{ $t("mobileOrder.admin.suspendSettings") }}
      </MoSuspendButton>
      <div
        v-else
        class="flex h-14 items-center justify-center rounded-full bg-black bg-opacity-5 px-4 text-red-700"
      >
        <i class="material-icons mr-2 text-lg">remove_shopping_cart</i>
        <span class="text-sm font-bold">
          {{ $t("mobileOrder.admin.suspendSettings") }}
          {{ $t("mobileOrder.admin.suspendAllStore") }}</span
        >
      </div>
    </div>

    <o-modal v-model:active="isOpenMoSuspendOffModal" :width="488">
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
          <o-radio v-model="suspendSelect" :native-value="1" :key="1">
            <div>{{ $t("mobileOrder.admin.suspendAll") }}</div>
          </o-radio>
          <o-radio v-model="suspendSelect" :native-value="2" :key="2">
            <div>{{ $t("mobileOrder.admin.suspendPickup") }}</div>
          </o-radio>
        </div>

        <div class="mt-10 flex items-center justify-center space-x-4">
          <!-- ToDoキャンセルボタンでダイアログを閉じる-->
          <div
            class="inline-flex h-12 w-32 cursor-pointer items-center justify-center rounded-full bg-black bg-opacity-5"
            @click="toggleMoSuspendOffModal"
          >
            <span class="text-base font-bold text-black text-opacity-60">
              {{ $t("mobileOrder.admin.cancel") }}
            </span>
          </div>
          <!-- ToDo休止ボタンで休止する-->
          <div
            class="inline-flex h-12 w-32 cursor-pointer items-center justify-center rounded-full bg-op-teal shadow"
            @click="updateSuspend"
          >
            <span class="text-base font-bold text-white">
              {{ $t("mobileOrder.admin.suspend") }}
            </span>
          </div>
        </div>
      </div>
    </o-modal>

    <o-modal v-model:active="isOpenMoSuspendOnModal" :width="488">
      <div class="mx-2 my-6 rounded-lg bg-white p-6 shadow-lg">
        <!-- ToDo全ての注文受付を再開する場合は以下確認メッセージを表示-->
        <div class="font-bold text-black text-opacity-60">
          {{
            $t(
              isSuspendAllOrder
                ? "mobileOrder.admin.restoreConfirm"
                : "mobileOrder.admin.restorePickupConfirm"
            )
          }}
        </div>

        <div class="mt-10 flex items-center justify-center space-x-4">
          <!-- ToDoキャンセルボタンでダイアログを閉じる-->
          <div
            class="inline-flex h-12 w-32 cursor-pointer items-center justify-center rounded-full bg-black bg-opacity-5"
            @click="toggleMoSuspendOnModal"
          >
            <span class="text-base font-bold text-black text-opacity-60">
              {{ $t("mobileOrder.admin.cancel") }}
            </span>
          </div>
          <!-- ToDo再開ボタンで休止する-->
          <div
            class="inline-flex h-12 w-32 cursor-pointer items-center justify-center rounded-full bg-op-teal shadow"
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

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { db } from "@/lib/firebase/firebase9";
import { doc, updateDoc } from "firebase/firestore";
import MoSuspendButton from "./MoSuspendButton.vue";

export default defineComponent({
  components: {
    MoSuspendButton,
  },
  props: {
    isSuspendAllOrder: {
      type: Boolean,
      required: true,
    },
    isSuspendPickup: {
      type: Boolean,
      required: true,
    },
    isAllShop: {
      type: Boolean,
      required: true,
    },
  },
  emit: ["resetSuspend", "setAllOrderSuspend", "setPickupSuspend"],
  setup(props, ctx) {
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
      ctx.emit("resetSuspend");
      toggleMoSuspendOnModal();
    };
    const updateSuspend = () => {
      if (Number(suspendSelect.value) === 1) {
        ctx.emit("setAllOrderSuspend");
      } else if (Number(suspendSelect.value) === 2) {
        ctx.emit("setPickupSuspend");
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
