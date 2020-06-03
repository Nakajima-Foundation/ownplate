<template>
  <div class="bg-surface r-8 d-low m-t-8 p-l-16 p-r-16 p-t-16 p-b-16">
    <div id="card-element"></div>
  </div>
</template>

<script>
import { getStripeInstance } from "~/plugins/stripe.js";
import { functions } from "~/plugins/firebase.js";

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
      this.stripe = getStripeInstance(/*this.stripeAccount*/);
      this.configureStripe();
    }
  },
  watch: {
    stripeAccount: function(newVal, oldVal) {
      this.stripe = getStripeInstance(/*newVal*/);
      this.configureStripe();
    }
  },
  methods: {
    async createPaymentMethod() {
      const { token } = await this.stripe.createToken(this.cardElement);
      console.log("****Token", token.id);
      const stripeUpdateCustomer = functions.httpsCallable(
        "stripeUpdateCustomer"
      );
      const result = await stripeUpdateCustomer({ token: token.id });
      console.log("****Result", result);

      const payload = await this.stripe.createPaymentMethod({
        type: "card",
        card: this.cardElement
      });
      return payload;
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
