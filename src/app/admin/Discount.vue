<template>
  <div class="mx-6 mt-6">
    <div v-if="promotion">
      <div class="mt-6">
        <div class="pb-2 text-sm font-bold">
          名前
        </div>
        <div>
          <o-input type="text" v-model="promotion.promotionName"/>
        </div>
      </div>
      <div class="mt-6">
        <div class="pb-2 text-sm font-bold">
          有効
        </div>
        <o-select v-model="promotion.enable">
          <option
            v-for="(result, key) in toBeOrNotSelect"
            :value="result.value"
            :key="key"
            >
            {{ result.message }}
          </option>
        </o-select>
      </div>
      <div class="mt-6">
        <div class="pb-2 text-sm font-bold">
          期間
        </div>
        
        <o-select v-model="promotion.hasTerm">
          <option
            v-for="(result, key) in toBeOrNotSelect"
            :value="result.value"
            :key="key"
            >
            {{ result.message }}
          </option>
        </o-select>

        <o-field>
          <o-datepicker
            icon="calendar-today"
            v-model="promotion.termFrom.toDate()"
            :min-date="new Date()"
            expanded
            :placeholder="$t('shopInfo.temporaryClosureSelect')"
            >
          </o-datepicker>
          <o-datepicker
            icon="calendar-today"
            v-model="promotion.termTo.toDate()"
            :min-date="new Date()"
            expanded
            :placeholder="$t('shopInfo.temporaryClosureSelect')"
            >
          </o-datepicker>
        </o-field>
      </div>
      <div class="mt-6">
        <div class="pb-2 text-sm font-bold">
          利用可能最低金額
        </div>
        <div>
          <o-field>
            <o-input type="number" v-model="promotion.discountThreshold" class="w-1/2"
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
          割引
        </div>
        <o-field>
          <o-input type="text" v-model="promotion.discountValue" class="w-1/2" />
          <span class="button is-static">
            {{ $t("currency.JPY") }}
          </span>
        </o-field>
      </div>
      <div class="mt-6">
        <div class="pb-2 text-sm font-bold">
          決済方法制限 
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
} from "@vue/composition-api";

import {
  useIsInMo,
} from "@/utils/utils";

import {
  toBeOrNotSelect,
  yesOrNoSelect,
  promotionPaymentRestrictionsSelect,
} from "@/config/constant";

  
import { getPromotion } from "@/utils/promotion";
import { PromotionData } from "@/models/promotion";

export default defineComponent({
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
  setup(props, ctx) {
    const route = ctx.root.$route;
    const discountId = route.params.discountId as string;

    const id = props.isInMo ? props.moPrefix : props.shopInfo?.restaurantId;
    const promotion = ref<PromotionData|null>(null);
    
    getPromotion(props.isInMo, id as string, discountId).then(data => {
      promotion.value = data;
    });

    const save = () => {
      console.log(promotion.value);
    };

    return {
      promotion,
      save,
      toBeOrNotSelect,
      yesOrNoSelect,
      promotionPaymentRestrictionsSelect,
    };
  }
});

</script>
