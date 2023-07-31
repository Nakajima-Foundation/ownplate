<template>
  <div v-if="notFound">
    404
  </div>
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
            class="mt-6 lg:flex lg:items-center"
            :shopInfo="shopInfo"
            backLink="/admin/restaurants/"
            :showSuspend="false"
            :isInMo="isInMo"
            :moPrefix="moPrefix"
            />
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-6"></div>
    </div>
       <!-- Save -->
      <div class="mt-12 flex justify-center space-x-4">
        <button
          @click="cancel"
          class="inline-flex h-12 items-center rounded-full bg-black bg-opacity-5 px-6"
          >
          <span class="text-base font-bold text-black text-opacity-60">
            {{ $t("button.cancel") }}
          </span>
        </button>

        <button
          @click="save"
          class="inline-flex h-12 items-center justify-center rounded-full bg-op-teal px-6 shadow"
          >
          <span class="text-base font-bold text-white">
            {{ $t("editCommon.save") }}
          </span>
        </button>
      </div>

    <div v-if="promotion">
      <div class="mt-6">
        <div class="pb-2 text-sm font-bold">
          {{ $t("admin.promotion.name") }}
        </div>
        <div>
          <o-input type="text" v-model="promotion.promotionName"/>
        </div>
      </div>
      <div class="mt-6">
        <div class="pb-2 text-sm font-bold">
          {{ $t("admin.promotion.activation") }}
        </div>
        <o-select v-model="promotion.enable">
          <option
            v-for="(result, key) in toBeOrNotSelect"
            :value="result.value"
            :key="key"
            >
            {{ $t('admin.' + result.messageKey) }}
          </option>
        </o-select>
      </div>
      <div class="mt-6">
        <div class="pb-2 text-sm font-bold">
          {{ $t("admin.promotion.type") }}
        </div>
        <o-select v-model="promotion.type">
          <option
            v-for="(result, key) in discountTypeSelect"
            :value="result.value"
            :key="key"
            >
            {{ $t('admin.promotion.' + result.messageKey) }}
          </option>
        </o-select>
      </div>
      <div class="mt-6">
        <div class="pb-2 text-sm font-bold">
          {{ $t("admin.promotion.period") }}
        </div>

        <o-select v-model="promotion.hasTerm">
          <option
            v-for="(result, key) in toBeOrNotSelect"
            :value="result.value"
            :key="key"
            >
            {{ $t('admin.' + result.messageKey) }}
          </option>
        </o-select>

        <o-field v-if="promotion.hasTerm">
          <o-datetimepicker
            icon="calendar-today"
            v-model="termFromDate"
            :min-date="new Date()"
            expanded
            :placeholder="$t('shopInfo.temporaryClosureSelect')"
						class="lg:w-96"
            >
          </o-datetimepicker>
          <o-datetimepicker
            icon="calendar-today"
            v-model="termToDate"
            :min-date="new Date()"
            expanded
            :placeholder="$t('shopInfo.temporaryClosureSelect')"
						class="lg:w-96"
            >
          </o-datetimepicker>
        </o-field>
      </div>
      <div class="mt-6 w-40">
        <div class="pb-2 text-sm font-bold">
          {{ $t("admin.promotion.minimumAmount") }}
        </div>
        <div>
          <o-field>
            <o-input type="number" v-model="promotion.discountThreshold"
                     :step="1"
                     min="0"
                     />
            <div>
              <span class="button is-static">
                {{ $t("currency.JPY") }}
              </span>
            </div>
          </o-field>
        </div>
      </div>
      <div class="mt-6">
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
      <div class="mt-6">
        <div class="pb-2 text-sm font-bold">
          {{ $t("admin.promotion.discounts") }}
        </div>
        <o-select v-model="promotion.discountMethod">
          <option
            v-for="(result, key) in discountMethodSelect"
            :value="result.value"
            :key="key"
            >
            {{ $t('admin.promotion.' + result.messageKey) }}
          </option>
        </o-select>
      </div>
      <div class="mt-6 w-40">
        <div class="pb-2 text-sm font-bold">
          <template v-if="promotion.discountMethod === 'amount'">
            {{ $t("admin.promotion.amount") }}
          </template>
          <template v-else>
            {{ $t("admin.promotion.ratio") }}
          </template>
        </div>
        <o-field >
          <o-input type="text" v-model="promotion.discountValue" />
          <span class="button is-static">
            <template v-if="promotion.discountMethod === 'amount'">
              {{ $t("currency.JPY") }}
            </template>
            <template v-else>
              %
            </template>
          </span>
        </o-field>
      </div>
      <div class="mt-6">
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
      <div class="mt-6 flex justify-center space-x-4">
        <button
          @click="cancel"
          class="inline-flex h-12 items-center rounded-full bg-black bg-opacity-5 px-6"
          >
          <span class="text-base font-bold text-black text-opacity-60">
            {{ $t("button.cancel") }}
          </span>
        </button>

        <button
          @click="save"
          class="inline-flex h-12 items-center justify-center rounded-full bg-op-teal px-6 shadow"
          >
          <span class="text-base font-bold text-white">
            {{ $t("editCommon.save") }}
          </span>
        </button>
      </div>
    </div>
</div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
} from "vue";
import { db } from "@/lib/firebase/firebase9";

import AdminHeader from "@/app/admin/AdminHeader.vue";
import BackButton from "@/components/BackButton.vue";

import {
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

import {
  useIsInMo,
} from "@/utils/utils";


import {
  toBeOrNotSelect,
  toBeOrNotSelect2,
  yesOrNoSelect,
  discountMethodSelect,
  discountTypeSelect,
  promotionPaymentRestrictionsSelect,
} from "@/config/constant";


import {
  getPromotion,
  getPromotionDocumentPath,
} from "@/utils/promotion";
import { PromotionData } from "@/models/promotion";

import {
  useRoute,
  useRouter,
} from "vue-router";
import {
  useAdminUids,
  notFoundResponse,
} from "@/utils/utils";
import { checkShopAccount } from "@/utils/userPermission";

export default defineComponent({
  components: {
    AdminHeader,
    BackButton,
  },
  props: {
    isInMo: {
      type: Boolean,
      required: false,
    },
    moPrefix: {
      type: String,
      required: false,
    },
    shopInfo: {
      type: Object,
      required: false,
    },

  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const discountId = route.params.discountId as string;

    const id = props.isInMo ? props.moPrefix : props.shopInfo?.restaurantId;
    const promotion = ref<PromotionData|null>(null);

    const termFromDate = ref();
    const termToDate = ref();

    const { ownerUid, uid, isOwner } = useAdminUids();
    if (props.isInMo) {
      if (!isOwner.value) {
        return notFoundResponse;
      }
      if (props.shopInfo) {
        return notFoundResponse;
      }
    } else if (
      !checkShopAccount(props.shopInfo || {}, ownerUid.value) || !ownerUid.value
    ) {
      return notFoundResponse;
    }

    getPromotion(props.isInMo, id as string, discountId).then(data => {
      promotion.value = data;
      termFromDate.value = data.termFrom.toDate();
      termToDate.value = data.termTo.toDate();
    });

    const back = () => {
      router.push({
        path: props.isInMo ? `/admin/discounts` : `/admin/restaurants/${props.shopInfo?.restaurantId}/discounts`,
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
      const path = getPromotionDocumentPath(props.isInMo, id as string, discountId);
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
  }
});

</script>
