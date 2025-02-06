<template>
  <div v-if="notFound">404</div>
  <div class="mx-6" v-else>
    <!-- QR Header Area -->
    <div class="columns is-gapless" v-if="shopInfo">
      <!-- Left Gap -->
      <div class="column is-narrow w-6"></div>
      <!-- Center Column -->
      <div class="column">
        <!-- Nav Bar -->
        <!-- Back Button and Restaurant Profile -->
        <AdminHeader
          class="mt-4 lg:flex lg:items-center"
          :shopInfo="shopInfo"
          :backLink="`/admin/restaurants/${shopInfo.restaurantId}/discounts`"
          :showSuspend="false"
          backText="button.backToDiscounts"
          iconText="arrow_back"
          pageText="discountDetail"
        />
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-6"></div>
    </div>
    <!-- Save -->
    <div class="mt-4 flex justify-center space-x-4">
      <button
        @click="cancel"
        class="inline-flex h-12 items-center rounded-full bg-black bg-opacity-5 px-6"
      >
        <span class="text-base font-bold text-black text-opacity-60">
          {{ $t("button.cancel") }}
        </span>
      </button>

      <t-button
        @click="save"
        class="h-12 px-8 font-bold text-white"
      >
        {{ $t("editCommon.save") }}
      </t-button>
    </div>

    <div v-if="promotion">
      <div class="mt-2">
        <div class="pb-2 text-sm font-bold">
          {{ $t("admin.promotion.name") }}
        </div>
        <div>
          <o-input type="text" v-model="promotion.promotionName" />
        </div>
      </div>
      <div class="mt-2">
        <div class="pb-2 text-sm font-bold">
          {{ $t("admin.promotion.activation") }}
        </div>
        <o-select v-model="promotion.enable">
          <option
            v-for="(result, key) in toBeOrNotSelect"
            :value="result.value"
            :key="key"
          >
            {{ $t("admin." + result.messageKey) }}
          </option>
        </o-select>
      </div>
      <div class="mt-2">
        <div class="pb-2 text-sm font-bold">
          {{ $t("admin.promotion.type") }}
        </div>
        <o-select v-model="promotion.type">
          <option
            v-for="(result, key) in discountTypeSelect"
            :value="result.value"
            :key="key"
          >
            {{ $t("admin.promotion." + result.messageKey) }}
          </option>
        </o-select>
      </div>
      <div class="mt-2">
        <div class="pb-2 text-sm font-bold">
          {{ $t("admin.promotion.period") }}
        </div>

        <o-select v-model="promotion.hasTerm">
          <option
            v-for="(result, key) in toBeOrNotSelect"
            :value="result.value"
            :key="key"
          >
            {{ $t("admin." + result.messageKey) }}
          </option>
        </o-select>

        <o-field v-if="promotion.hasTerm" class="has-addons">
          <o-datetimepicker
            icon="calendar-today"
            v-model="termFromDate"
            :min-date="new Date()"
            expanded
            :placeholder="$t('shopInfo.temporaryClosureSelect')"
            class="lg:w-96"
          />
          <o-datetimepicker
            icon="calendar-today"
            v-model="termToDate"
            :min-date="new Date()"
            expanded
            :placeholder="$t('shopInfo.temporaryClosureSelect')"
            class="lg:w-96"
          />
        </o-field>
      </div>
      <div class="mt-2 w-40">
        <div class="pb-2 text-sm font-bold">
          {{ $t("admin.promotion.minimumAmount") }}
        </div>
        <div>
          <o-field class="has-addons">
            <o-input
              type="number"
              v-model="promotion.discountThreshold"
              :step="1"
              min="0"
            />
            <span class="button is-static">
              {{ $t("currency.JPY") }}
            </span>
          </o-field>
        </div>
      </div>
      <div class="mt-2">
        <div class="pb-2 text-sm font-bold">
          {{ $t("admin.promotion.limitation") }}
        </div>
        <o-select v-model="promotion.usageRestrictions">
          <option
            v-for="(result, key) in toBeOrNotSelect2"
            :value="result.value"
            :key="key"
          >
            {{ result.message }}
          </option>
        </o-select>
      </div>
      <div class="mt-2">
        <div class="pb-2 text-sm font-bold">
          {{ $t("admin.promotion.discounts") }}
        </div>
        <o-select v-model="promotion.discountMethod">
          <option
            v-for="(result, key) in discountMethodSelect"
            :value="result.value"
            :key="key"
          >
            {{ $t("admin.promotion." + result.messageKey) }}
          </option>
        </o-select>
      </div>
      <div class="mt-2 w-40">
        <div class="pb-2 text-sm font-bold">
          <template v-if="promotion.discountMethod === 'amount'">
            {{ $t("admin.promotion.amount") }}
          </template>
          <template v-else>
            {{ $t("admin.promotion.ratio") }}
          </template>
        </div>
        <o-field class="has-addons">
          <o-input type="text" v-model="promotion.discountValue" />
          <span class="button is-static">
            <template v-if="promotion.discountMethod === 'amount'">
              {{ $t("currency.JPY") }}
            </template>
            <template v-else> % </template>
          </span>
        </o-field>
      </div>
      <div class="mt-2">
        <div class="pb-2 text-sm font-bold">
          {{ $t("admin.promotion.paymentMethod") }}
        </div>
        <o-select v-model="promotion.paymentRestrictions">
          <option
            v-for="(result, key) in promotionPaymentRestrictionsSelect"
            :value="result.value"
            :key="key"
          >
            {{ result.message }}
          </option>
        </o-select>
      </div>
      <!-- Save -->
      <div class="mt-2 flex justify-center space-x-4">
        <button
          @click="cancel"
          class="inline-flex h-12 items-center rounded-full bg-black bg-opacity-5 px-6"
        >
          <span class="text-base font-bold text-black text-opacity-60">
            {{ $t("button.cancel") }}
          </span>
        </button>

        <t-button
          @click="save"
          class="h-12 px-8 font-bold text-white"
        >
          {{ $t("editCommon.save") }}
        </t-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { db } from "@/lib/firebase/firebase9";

import AdminHeader from "@/app/admin/AdminHeader.vue";

import { updateDoc, doc, Timestamp } from "firebase/firestore";

import {
  toBeOrNotSelect,
  toBeOrNotSelect2,
  yesOrNoSelect,
  discountMethodSelect,
  discountTypeSelect,
  promotionPaymentRestrictionsSelect,
} from "@/config/constant";

import { getPromotion, getPromotionDocumentPath } from "@/utils/promotion";
import { PromotionData } from "@/models/promotion";

import { useRoute, useRouter } from "vue-router";
import { useAdminUids, notFoundResponse } from "@/utils/utils";
import { checkShopAccount } from "@/utils/userPermission";

export default defineComponent({
  components: {
    AdminHeader,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const discountId = route.params.discountId as string;

    const id = props.shopInfo.restaurantId;
    const promotion = ref<PromotionData | null>(null);

    const termFromDate = ref();
    const termToDate = ref();

    const { ownerUid } = useAdminUids();
    if (
      !checkShopAccount(props.shopInfo || {}, ownerUid.value) ||
      !ownerUid.value
    ) {
      return notFoundResponse;
    }

    getPromotion(id as string, discountId).then((data) => {
      promotion.value = data;
      termFromDate.value = data.termFrom.toDate();
      termToDate.value = data.termTo.toDate();
    });

    const back = () => {
      router.push({
        path: `/admin/restaurants/${props.shopInfo?.restaurantId}/discounts`,
      });
    };
    const save = async () => {
      const {
        promotionName,
        enable,
        hasTerm,
        discountThreshold,
        discountValue,
        discountMethod,
        paymentRestrictions,
        usageRestrictions,
      } = promotion.value as PromotionData;
      const updateData = {
        promotionName,
        enable,
        hasTerm,
        discountThreshold: Number(discountThreshold),
        discountValue: Number(discountValue),
        paymentRestrictions,
        usageRestrictions,
        discountMethod,
        termFrom: Timestamp.fromDate(termFromDate.value),
        termTo: Timestamp.fromDate(termToDate.value),
      };
      const path = getPromotionDocumentPath(id as string, discountId);
      await updateDoc(doc(db, path), updateData);

      back();
    };

    const cancel = () => {
      back();
    };

    return {
      promotion,
      termFromDate,
      termToDate,
      save,
      toBeOrNotSelect,
      toBeOrNotSelect2,
      yesOrNoSelect,
      discountMethodSelect,
      discountTypeSelect,
      promotionPaymentRestrictionsSelect,
      cancel,
      notFound: false,
    };
  },
});
</script>

<style scoped>
:deep(.field.has-addons) {
  display: flex;
  .control:first-child:not(:only-child) .input {
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
  }
}

:deep(.control.has-icons-left) {
  border-radius: 4px;
  .icon.is-left {
    left: 0;
  }
  .icon {
    align-items: center;
    display: inline-flex;
    justify-content: center;
    color: #dbdbdb;
    pointer-events: none;
    position: absolute;
    top: 0;
    width: 2.5em;
    z-index: 4;
  }
  .input {
    padding-left: 2.5em;
  }
}

.button {
  border-width: 1px;
  border-radius: 4px;
  justify-content: center;
  padding-bottom: calc(0.5em - 1px);
  padding-left: 1em;
  padding-right: 1em;
  padding-top: calc(0.5em - 1px);
  text-align: center;
  &.is-static {
    background-color: #f5f5f5;
    border-color: #dbdbdb;
    color: #7a7a7a;
    box-shadow: none;
    pointer-events: none;
  }
}
</style>
