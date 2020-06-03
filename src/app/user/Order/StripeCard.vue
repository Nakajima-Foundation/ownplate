<template>
  <div>
    <div v-if="storedCard" class="m-t-16 m-l-16">
      <b-checkbox v-model="useStoredCard">
        <span>{{storedCard.brand}}</span>
        <span>**** **** **** {{storedCard.last4}}</span>
      </b-checkbox>
    </div>
    <div v-show="!useStoredCard" class="bg-surface r-8 d-low m-t-8 p-l-16 p-r-16 p-t-16 p-b-16">
      <div id="card-element"></div>
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
      cardElement: {}
    };
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
  computed: {
    user() {
      return this.$store.state.user;
    }
  },
  methods: {
    async createToken() {
      if (!this.useStoredCard) {
        const { token } = await this.stripe.createToken(this.cardElement);
        //console.log("***toke", token, token.card.last4);
        const { data } = await stripeUpdateCustomer({ tokenId: token.id });
        console.log("stripeUpdateCustomer", data);
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
    }
  }
};
</script>
