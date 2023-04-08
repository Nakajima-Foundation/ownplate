<template>
  <div>
    <div v-if="!stripeJCB" class="text-sm font-bold text-black text-opacity-60">
      {{ $t("order.no_jcb") }}
    </div>

    <div
      v-if="storedCard"
      class="mt-2 flex items-center rounded-lg bg-white p-4 shadow"
    >
      <o-checkbox v-model="useStoredCard">
        <div class="text-base">
          <span>{{ storedCard.brand }}</span>
          <span>**** **** **** {{ storedCard.last4 }}</span>
          <span>・{{ storedCard.exp_month }}/{{ storedCard.exp_year }}</span>
        </div>
      </o-checkbox>
    </div>

    <div v-show="!useStoredCard">
      <!-- Enter New Card -->
      <div class="mt-2 h-14 rounded-lg bg-white p-4 shadow">
        <div id="card-element"></div>
      </div>

      <!-- About CVC -->
      <div class="mt-1">
        <!-- CVC Button -->
        <div class="text-right">
          <a class="inline-flex items-center justify-center" @click="openCVC()">
            <i class="material-icons mr-1 text-lg text-op-teal">help_outline</i>
            <span class="text-sm font-bold text-op-teal">{{
              $t("order.whatsCVC")
            }}</span>
          </a>
        </div>

        <!-- CVC Popup-->
        <o-modal v-model:active="CVCPopup" :width="488" scroll="keep">
          <div class="mx-2 my-6 rounded-lg bg-white p-6 shadow-lg">
            <!-- Title -->
            <div class="text-xl font-bold text-black text-opacity-40">
              {{ $t("order.whatsCVC") }}
            </div>

            <!-- 3 Digits -->
            <div
              class="mt-6 mt-6 rounded-lg bg-black bg-opacity-5 p-4 text-center"
            >
              <div class="text-xl font-bold">
                Visa, MasterCard, JCB, Diners Club, DISCOVER
              </div>

              <div class="mt-2 text-center text-base font-bold text-blue-500">
                {{ $t("order.3digitsCVC") }}
              </div>

              <div class="mt-2">
                <img src="/CVC-3digits-1.svg" />
              </div>

              <div class="mt-1">
                <img src="/CVC-3digits-2.svg" />
              </div>
            </div>

            <!-- 4 Digits -->
            <div
              class="mt-6 mt-6 rounded-lg bg-black bg-opacity-5 p-4 text-center"
            >
              <div class="text-xl font-bold">American Express</div>

              <div class="mt-2 text-center text-base font-bold text-blue-500">
                {{ $t("order.4digitsCVC") }}
              </div>

              <div class="mt-2">
                <img src="/CVC-4digits-Amex.svg" />
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-6 text-center">
              <a
                @click="closeCVC()"
                class="inline-flex h-12 items-center justify-center rounded-full bg-black bg-opacity-5 px-6"
                style="min-width: 8rem"
              >
                <div class="text-base font-bold text-black text-opacity-60">
                  {{ $t("menu.close") }}
                </div>
              </a>
            </div>
          </div>
        </o-modal>
      </div>

      <!-- Save Card Info for Reuse -->
      <div class="mt-2 text-center">
        <o-checkbox v-model="reuse"
          ><div class="text-sm font-bold">
            {{ $t("order.reuseCard") }}
          </div></o-checkbox
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  watch,
  onMounted,
} from "vue";

import { getStripeInstance, stripeUpdateCustomer } from "@/lib/stripe/stripe";
import { db } from "@/lib/firebase/firebase9";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import moment from "moment";

import { useUserData } from "@/utils/utils";
import { useStore } from "vuex";

export default defineComponent({
  props: {
    stripeJCB: {
      type: Boolean,
      required: true,
    },
  },
  setup(_, ctx) {
    const { user } = useUserData();
    const store = useStore();
    
    const stripe = getStripeInstance();
    const cardElem = ref<any>(null);
    let elementStatus = { complete: false };

    const storedCard = ref(null);
    const useStoredCard = ref(false);
    const CVCPopup = ref(false);
    const reuse = ref(true);

    const configureStripe = async () => {
      const elements = stripe.elements();
      const stripeRegion = store.getters.stripeRegion;
      const cardElement = elements.create("card", {
        hidePostalCode: stripeRegion.hidePostalCode,
        style: {
          base: {
            fontWeight: 600,
            fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
            fontSize: "16px",
            fontSmoothing: "antialiased",
            ":-webkit-autofill": {
              color: "#333",
            },
            "::placeholder": {
              color: "#999",
            },
          },
          invalid: {
            iconColor: "#FFC7EE",
            color: "#FFC7EE",
          },
        },
      });
      cardElement.mount("#card-element");
      cardElem.value = cardElement;
      console.log(cardElem.value);
      cardElem.value.addEventListener("change", (status: any) => {
        elementStatus = status;
        ctx.emit("change", status);
      });

      try {
        const stripeInfo = (
          await getDoc(doc(db, `/users/${user.value.uid}/readonly/stripe`))
        ).data();
      
        if (stripeInfo && stripeInfo.card) {
          if (stripeInfo.updatedAt.toDate() > moment().subtract(180, "days").toDate()) {
            storedCard.value = stripeInfo.card;
            useStoredCard.value = true;
            ctx.emit("change", { complete: true });
          }
        }
      } catch (e) {
        console.log("stripe expired")
      }
    };

    onMounted(() => {
      configureStripe();
    });
    
    watch(useStoredCard, (newValue) => {
      ctx.emit("change", newValue ? { complete: true } : elementStatus);
    });

    const createToken = async () => {
      if (!useStoredCard.value) {
        const { token } = await stripe.createToken(cardElem.value);
        const tokenId = token.id;
        const { data } = await stripeUpdateCustomer({
          tokenId,
          reuse: reuse.value,
        });
        // console.log("stripeUpdateCustomer", data, tokenId);
      }
    };
    const openCVC = () => {
      CVCPopup.value = true;
    };
    const closeCVC = () => {
      CVCPopup.value = false;
    };
    return {
      useStoredCard,
      storedCard,
      CVCPopup,
      reuse,

      openCVC,
      closeCVC,

      createToken, // for parent component
    };
    
  },
});
</script>
