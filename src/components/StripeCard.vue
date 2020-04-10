<template>
  <div
    style="padding: 18px; background: #fff; border-raduis: 12px; box-shadow: 0px 2px 4px rgba(0,0,0,0.13);"
  >
    <div id="card-element"></div>
  </div>
</template>

<script>
export default {
  head: {
    script: [{ src: "https://js.stripe.com/v3/" }]
  },

  data() {
    return {
      stripeAPIToken: process.env.STRIPE_API_KEY,
      stripe: {},
      cardElement: {}
    };
  },

  mounted() {
    this.includeStripe(
      "js.stripe.com/v3/",
      function() {
        this.configureStripe();
      }.bind(this)
    );
  },

  methods: {
    async createPaymentMethod() {
      const payload = await this.stripe.createPaymentMethod({
        type: "card",
        card: this.cardElement
      });
      return payload;
    },
    includeStripe(URL, callback) {
      let documentTag = document,
        tag = "script",
        object = documentTag.createElement(tag),
        scriptTag = documentTag.getElementsByTagName(tag)[0];
      object.src = "//" + URL;
      if (callback) {
        object.addEventListener(
          "load",
          function(e) {
            callback(null, e);
          },
          false
        );
      }
      scriptTag.parentNode.insertBefore(object, scriptTag);
    },

    configureStripe() {
      const stripe = Stripe(this.stripeAPIToken);
      const elements = stripe.elements();
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
      this.stripe = stripe;
      this.cardElement = cardElement;
    }
  }
};
</script>
