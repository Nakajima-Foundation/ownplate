<template>
  <div
    v-if="shopInfo && shopInfo.orderNotice && shopInfo.orderNotice.length > 0"
  >
    <div class="mt-6">
      <div class="text-xl font-bold text-black text-opacity-30">
        {{ $t("order.orderNotice") }}
      </div>

      <div class="mt-2 rounded-lg bg-white p-4 shadow">
        <div class="flex">
          <div class="mr-2">
            <i class="material-icons text-2xl text-red-700">error</i>
          </div>
          <div
            class="flex-1 text-base text-red-700"
            :class="shopInfo.enablePreline ? 'whitespace-pre-line' : ''"
          >
            {{ shopInfo.orderNotice }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";
export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
});
</script>
