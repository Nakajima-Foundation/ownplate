<template>
  <div>
    <div v-if="!stripeJCB" class="text-sm font-bold text-black text-opacity-60">
      {{ $t("order.no_jcb") }}
    </div>

    <div v-if="storedCard" class="bg-white rounded-lg shadow p-4 mt-2">
      <b-checkbox v-model="useStoredCard">
        <div class="text-base">
          <span>{{ storedCard.brand }}</span>
          <span>**** **** **** {{ storedCard.last4 }}</span>
        </div>
      </b-checkbox>
    </div>

    <div v-show="!useStoredCard">
      <!-- Enter New Card -->
      <div class="bg-white rounded-lg shadow p-4 mt-2">
        <div id="card-element"></div>
      </div>

      <!-- About CVC -->
      <div class="mt-1">
        <!-- CVC Button -->
        <div class="text-right">
          <a class="inline-flex justify-center items-center" @click="openCVC()">
            <i class="material-icons text-lg text-op-teal mr-1">help_outline</i>
            <span class="text-sm font-bold text-op-teal">{{
              $t("order.whatsCVC")
            }}</span>
          </a>
        </div>

        <!-- CVC Popup-->
        <b-modal :active.sync="CVCPopup" :width="488" scroll="keep">
          <div class="mx-2 my-6 p-6 bg-white shadow-lg rounded-lg">
            <!-- Title -->
            <div class="text-xl font-bold text-black text-opacity-40">
              {{ $t("order.whatsCVC") }}
            </div>

            <!-- 3 Digits -->
            <div
              class="bg-black bg-opacity-5 rounded-lg m-t-24 p-4 mt-6 text-center"
            >
              <div class="text-xl font-bold">
                Visa, MasterCard, JCB, Diners Club, DISCOVER
              </div>

              <div class="mt-2 text-base font-bold text-center text-blue-500">
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
              class="bg-black bg-opacity-5 rounded-lg m-t-24 p-4 mt-6 text-center"
            >
              <div class="text-xl font-bold">American Express</div>

              <div class="mt-2 text-base font-bold text-center text-blue-500">
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
                class="inline-flex justify-center items-center h-12 rounded-full px-6 bg-black bg-opacity-5"
                style="min-width: 8rem"
              >
                <div class="text-base font-bold text-black text-opacity-60">
                  {{ $t("menu.close") }}
                </div>
              </a>
            </div>
          </div>
        </b-modal>
      </div>

      <!-- Save Card Info for Reuse -->
      <div class="mt-2 text-center">
        <b-checkbox v-model="reuse"
          ><div class="text-sm font-bold">
            {{ $t("order.reuseCard") }}
          </div></b-checkbox
        >
      </div>
    </div>
  </div>
</template>

<script>
import { getStripeInstance, stripeUpdateCustomer } from "~/lib/stripe/stripe";
import { functions, db } from "~/plugins/firebase";

export default {
  data() {
    return {
      stripe: getStripeInstance(),
      storedCard: null,
      useStoredCard: false,
      elementStatus: { complete: false },
      cardElement: {},
      CVCPopup: false,
      reuse: true,
    };
  },
  props: {
    stripeJCB: {
      type: Boolean,
      required: true,
    },
  },
  async mounted() {
    this.configureStripe();
    const stripeInfo = (
      await db.doc(`/users/${this.user.uid}/readonly/stripe`).get()
    ).data();
    if (stripeInfo && stripeInfo.card) {
      this.storedCard = stripeInfo.card;
      this.useStoredCard = true;
      this.$emit("change", { complete: true });
    }
  },
  watch: {
    useStoredCard(newValue) {
      this.$emit("change", newValue ? { complete: true } : this.elementStatus);
    },
  },
  methods: {
    async createToken() {
      if (!this.useStoredCard) {
        const { token } = await this.stripe.createToken(this.cardElement);
        const tokenId = token.id + this.forcedError("token");
        //console.log("***toke", token, token.card.last4);
        const { data } = await stripeUpdateCustomer({
          tokenId,
          reuse: this.reuse,
        });
        console.log("stripeUpdateCustomer", data, tokenId);
      }
    },
    configureStripe() {
      const elements = this.stripe.elements();
      const stripeRegion = this.$store.getters.stripeRegion;
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
      this.cardElement = cardElement;
      this.cardElement.addEventListener("change", (status) => {
        this.elementStatus = status;
        this.$emit("change", status);
      });
    },
    openCVC() {
      this.CVCPopup = true;
    },
    closeCVC() {
      this.CVCPopup = false;
    },
  },
};
</script>
