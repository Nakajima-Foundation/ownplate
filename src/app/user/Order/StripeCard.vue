<template>
  <div>
    <div v-if="storedCard">
      <p>{{storedCard.last4}}</p>
    </div>
    <div v-else class="bg-surface r-8 d-low m-t-8 p-l-16 p-r-16 p-t-16 p-b-16">
      <div id="card-element"></div>
    </div>
  </div>
</template>

<script>
import { getStripeInstance, stripeUpdateCustomer } from "~/plugins/stripe.js";
import { functions } from "~/plugins/firebase.js";

export default {
  data() {
    return {
      stripe: getStripeInstance(),
      storedCard: null,
      cardElement: {}
    };
  },
  mounted() {
    this.configureStripe();
  },
  methods: {
    async createToken() {
      const { token } = await this.stripe.createToken(this.cardElement);
      console.log("***toke", token, token.card.last4);
      const result = await stripeUpdateCustomer({ tokenId: token.id });
      console.log("createToken", result);
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
      this.cardElement.addEventListener("change", event => {
        this.$emit("change", event);
      });
    }
  }
};
</script>
