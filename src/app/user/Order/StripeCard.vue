<template>
  <div>
    <div v-if="!stripeJCB" class="m-t-8 p-t-8 p-l-16">{{$t("order.no_jcb")}}</div>
    <div v-if="storedCard" class="bg-surface r-8 d-low m-t-8 p-l-16 p-r-16 p-t-16 p-b-16">
      <b-checkbox v-model="useStoredCard">
        <span class="t-body1 c-text-black-high">
          <span>{{storedCard.brand}}</span>
          <span>**** **** **** {{storedCard.last4}}</span>
        </span>
      </b-checkbox>
    </div>
    <div v-show="!useStoredCard">
      <!-- Enter New Card -->
      <div class="bg-surface r-8 d-low m-t-8 p-l-16 p-r-16 p-t-16 p-b-16">
        <div id="card-element"></div>
      </div>
      <!-- About CVC -->
      <div>
        <!-- CVC Button -->
        <div class="align-right">
          <div class="op-button-text" @click="openCVC()">
            <i class="material-icons">help_outline</i>
            <span>{{$t('order.whatsCVC')}}</span>
          </div>
        </div>
        <!-- CVC Popup-->
        <b-modal :active.sync="CVCPopup" :width="488" scroll="keep">
          <div class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
            <!-- Title -->
            <div class="t-h6 c-text-black-disabled">{{$t('order.whatsCVC')}}</div>

            <!-- 4 Digits -->
            <div class="bg-form r-8 align-center m-t-24 p-l-24 p-r-24 p-t-24 p-b-24">
              <div class="t-h6 c-text-black-medium">Visa, MasterCard, JCB, Diners Club, DISCOVER</div>
              <div class="t-subtitle1 c-status-blue m-t-8">{{$t('order.3digitsCVC')}}</div>
              <div class="m-t-8">
                <img src="~/static/CVC-3digits-1.svg" />
              </div>
              <div class="m-t-4">
                <img src="~/static/CVC-3digits-2.svg" />
              </div>
            </div>

            <!-- 3 Digits -->
            <div class="bg-form r-8 align-center m-t-24 p-l-24 p-r-24 p-t-24 p-b-24">
              <div class="t-h6 c-text-black-medium">American Express</div>
              <div class="t-subtitle1 c-status-blue m-t-8">{{$t('order.4digitsCVC')}}</div>
              <div class="m-t-8">
                <img src="~/static/CVC-4digits-Amex.svg" />
              </div>
            </div>
            <div class="m-t-24 align-center">
              <div class="op-button-small tertiary" @click="closeCVC()">{{$t('menu.close')}}</div>
            </div>
          </div>
        </b-modal>
      </div>
      <!-- Save Card Info for Reuse -->
      <div class="m-l-16 m-t-8">
        <b-checkbox v-model="reuse">{{ $t('order.reuseCard') }}</b-checkbox>
      </div>
    </div>
  </div>
</template>

<script>
import { getStripeInstance, stripeUpdateCustomer } from "~/plugins/stripe.js";
import { functions, db } from "~/plugins/firebase.js";

export default {
  data() {
    return {
      stripe: getStripeInstance(),
      storedCard: null,
      useStoredCard: false,
      elementStatus: { complete: false },
      cardElement: {},
      CVCPopup: false,
      reuse: true
    };
  },
  props: {
    stripeJCB: {
      type: Boolean,
      required: true
    }
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
    }
  },
  methods: {
    async createToken() {
      if (!this.useStoredCard) {
        const { token } = await this.stripe.createToken(this.cardElement);
        const tokenId = token.id + this.forcedError("token");
        //console.log("***toke", token, token.card.last4);
        const { data } = await stripeUpdateCustomer({
          tokenId,
          reuse: this.reuse
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
              color: "#333"
            },
            "::placeholder": {
              color: "#999"
            }
          },
          invalid: {
            iconColor: "#FFC7EE",
            color: "#FFC7EE"
          }
        }
      });
      cardElement.mount("#card-element");
      this.cardElement = cardElement;
      this.cardElement.addEventListener("change", status => {
        this.elementStatus = status;
        this.$emit("change", status);
      });
    },
    openCVC() {
      this.CVCPopup = true;
    },
    closeCVC() {
      this.CVCPopup = false;
    }
  }
};
</script>
