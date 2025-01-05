<template>
  <div>
    <div v-if="!stripeJCB" class="text-sm font-bold text-black text-opacity-60">
      {{ $t("order.no_jcb") }}
    </div>

    <div
      v-if="false"
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

    <div v-show="true">
      <!-- Enter New Card -->
      <div class="mt-2 rounded-lg bg-white p-4 shadow">
        <div id="card-element"></div>
      </div>

      <!-- About CVC -->
      <div class="mt-1">
        <!-- CVC Button -->
        <div class="text-right">
          <a
            class="inline-flex items-center justify-center cursor-pointer"
            @click="openCVC()"
          >
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
            <div class="mt-2 rounded-lg bg-black bg-opacity-5 p-4 text-center">
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
            <div class="mt-2 rounded-lg bg-black bg-opacity-5 p-4 text-center">
              <div class="text-xl font-bold">American Express</div>

              <div class="mt-2 text-center text-base font-bold text-blue-500">
                {{ $t("order.4digitsCVC") }}
              </div>

              <div class="mt-2">
                <img src="/CVC-4digits-Amex.svg" />
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-4 text-center">
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

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from "vue";

import { getStripeInstance, stripeUpdateCustomer } from "@/lib/stripe/stripe";
// import { db } from "@/lib/firebase/firebase9";
// import { doc, getDoc } from "firebase/firestore";
import moment from "moment";

// import { useUserData } from "@/utils/utils";
// import { useStore } from "vuex";

export default defineComponent({
  emits: ["change"],
  props: {
    stripeJCB: {
      type: Boolean,
      required: true,
    },
    stripeAccount: {
      type: String,
      required: true,
    },
    clientSecret: {
      type: String,
      required: true,
    },
  },
  setup(props, ctx) {
    const stripe = getStripeInstance(props.stripeAccount);
    const cardElem = ref<any>(null);
    let elementStatus = { complete: false };

    const storedCard = ref(null);
    const useStoredCard = ref(false);
    const CVCPopup = ref(false);
    const reuse = ref(true);

    const elements = stripe.elements(
      { clientSecret: props.clientSecret },
    );
    const configureStripe = () => {
      const cardElement = elements.create("payment", {});
      cardElement.mount("#card-element");
      cardElem.value = cardElement;
      // console.log(cardElem.value);
      cardElem.value.addEventListener("change", (status: any) => {
        elementStatus = status;
        ctx.emit("change", status);
      });

      try {
        /*
          const striipeInfo = (
          await getDoc(doc(db, `/users/${user.value.uid}/readonly/stripe`))
          ).data();
          */

        if (stripeInfo && stripeInfo.card) {
          const date = ("00" + String(stripeInfo.card.exp_month)).slice(-2);
          const expire = moment(
            `${stripeInfo.card.exp_year}${date}01T000000+0900`,
          )
            .endOf("month")
            .toDate();
          // console.log(expire);
          if (
            stripeInfo.updatedAt &&
            stripeInfo.updatedAt.toDate() >
              moment().subtract(180, "days").toDate()
          ) {
            if (expire > new Date()) {
              storedCard.value = stripeInfo.card;
              useStoredCard.value = true;
              ctx.emit("change", { complete: true });
            }
          }
        }
      } catch (e) {
        console.log(e);
        console.log("stripe expired");
      }
    };

    onMounted(() => {
      configureStripe();
    });

    watch(useStoredCard, (newValue) => {
      ctx.emit("change", newValue ? { complete: true } : elementStatus);
    });

    const confirmPayment = async () => {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // return_url: window.location.href
        },
        redirect: "if_required"
      });
      return result;
    };

    const confirmCardPayment = async () => {
      const result = await stripe.confirmCardPayment(props.clientSecret);
      return result;
    };
    
    const createToken = async () => {
      if (!useStoredCard.value) {
        const { token } = await stripe.createToken(cardElem.value);
        const tokenId = token.id;
        await stripeUpdateCustomer({
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
      confirmPayment,
      confirmCardPayment,
    };
  },
});
</script>
