<template>
  <div class="flex space-x-2">
    <Checkbox
      v-if="editable"
      :modelValue="available"
      @update:modelValue="update"
    />
    <div>
      <div
        class="inline-flex h-9 w-12 shrink-0 items-center justify-center rounded-sm bg-blue-500/10"
      >
        <div class="text-lg font-bold text-blue-500">
          {{ "x " + String(count) }}
        </div>
      </div>
      <div v-if="image" class="mt-1 shrink-0">
        <img
          :src="image"
          @error="FsmallImageErrorHandler"
          class="h-12 w-12 rounded-sm object-cover"
        />
      </div>
    </div>
    <div class="flex-1">
      <div class="text-base font-bold">
        <s v-if="editable && !available">
          {{ item.itemName }}
        </s>
        <span v-else>
          {{ item.itemName }}
        </span>
        <span v-if="isAdmin && item.itemAliasesName">
          <s v-if="editable && !available"> / {{ item.itemAliasesName }} </s>
          <span v-else> / {{ item.itemAliasesName }} </span>
        </span>
      </div>
      <div v-if="soldOutToday" class="text-xs text-red-600">
        {{ $t("sitemenu.soldOutToday") }}
      </div>

      <div v-if="specialRequest" class="mt-1 text-xs font-bold">
        <s v-if="editable && !available">
          {{ specialRequest }}
        </s>
        <span v-else>
          {{ specialRequest }}
        </span>
      </div>
    </div>

    <div class="shrink-0 text-right">
      <span class="text-base font-bold text-black/30">
        <s v-if="editable && !available">
          {{ $n(totalPrice, "currency") }}
        </s>
        <span v-else>
          {{ $n(totalPrice, "currency") }}
        </span>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "vue";
import { useI18n } from "vue-i18n";

import { formatOption, optionPrice } from "@/utils/strings";
import { roundPrice, smallImageErrorHandler, useUserData } from "@/utils/utils";
import { MenuData } from "@/models/menu";

import Checkbox from "@/components/form/checkbox.vue";

import moment from "moment-timezone";

export default defineComponent({
  components: {
    Checkbox,
  },
  props: {
    orderItem: {
      type: Object,
      required: true,
    },
    menuData: {
      type: Object as PropType<MenuData>,
      required: false,
    },
    editable: {
      type: Boolean,
      required: false,
    },
    available: {
      type: Boolean,
      required: false,
    },
    mkey: {
      type: Number,
      required: true,
    },
  },
  emits: ["update"],
  setup(props, context) {
    const { n } = useI18n({ useScope: "global" });

    const item = computed(() => {
      return props.orderItem.item;
    });
    const image = computed(() => {
      return (
        (item.value?.images?.item?.resizedImages || {})["600"] ||
        item.value.itemPhoto
      );
    });
    const count = computed(() => {
      return props.orderItem.count;
    });
    const displayOption = (option: string) => {
      return formatOption(option, (price) => n(price, "currency"));
    };
    const specialRequest = computed(() => {
      return props.orderItem.options
        .filter((choice: string) => choice)
        .map((choice: string) => displayOption(choice))
        .join(", ");
    });
    const totalPrice = computed(() => {
      let price = item.value.price;
      props.orderItem.options.forEach((option: string) => {
        const p = roundPrice(optionPrice(option));
        price += p;
      });
      return price * count.value;
    });
    const { isAdmin } = useUserData();

    const update = (value: boolean) => {
      context.emit("update", [props.mkey, value]);
    };
    const FsmallImageErrorHandler = (e: any) => {
      smallImageErrorHandler(e);
    };

    const today = moment().format("YYYY-MM-DD");
    const soldOutToday = computed(() => {
      return props.menuData?.soldOutToday === today;
    });
    return {
      item,
      image,
      count,
      specialRequest,
      totalPrice,
      update,
      FsmallImageErrorHandler,
      isAdmin,
      soldOutToday,
    };
  },
});
</script>
