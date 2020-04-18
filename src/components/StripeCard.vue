<template>
  <div
    style="padding: 16px 8px; background: #fff; border-raduis: 12px; box-shadow: 0px 2px 4px rgba(0,0,0,0.13);"
  >
    <div id="card-element"></div>
  </div>
</template>

<script>
import { getStripeInstance } from "~/plugins/stripe.js";

export default {
  props: ["stripeAccount"],
  data() {
    return {
      stripe: {}, //getStripeInstance(this.stripeAccount),
      cardElement: {}
    };
  },
  mounted() {
    if (this.stripeAccount) {
      this.stripe = getStripeInstance(this.stripeAccount);
      this.configureStripe();
    }
  },
  watch: {
    stripeAccount: function(newVal, oldVal) {
      this.stripe = getStripeInstance(newVal);
      this.configureStripe();
    }
  },
  methods: {
    async createPaymentMethod() {
      const payload = await this.stripe.createPaymentMethod({
        type: "card",
        card: this.cardElement
      });
      return payload;
    },
    configureStripe() {
      const elements = this.stripe.elements();
      const cardElement = elements.create("card", {
        hidePostalCode: true,
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
    }
  }
};
</script>
