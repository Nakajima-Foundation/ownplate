<template>
  <div>
    <div id="paymentRequestButton">
      <!-- A Stripe Element will be inserted here. -->
    </div>
  </div>
</template>

<script>
import { getAppleStripeInstance } from "~/plugins/stripe.js";
export default {
  props: {
    paymentInfo: {
      type: Object,
      required: true
    },
    orderInfo: {
      type: Object,
      required: true
    },
    shopInfo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      // connected accoutn
      // stripe: getAppleStripeInstance(this.paymentInfo.stripe),
      stripe: getAppleStripeInstance(this.paymentInfo.stripe),
      amount: 1000
    };
  },
  mounted() {
    console.log(this.orderInfo.total);
    const paymentRequest = this.stripe.paymentRequest({
      country: 'JP',
      currency: 'jpy',
      total: {
        label: this.shopInfo.restaurantName,
        amount: this.orderInfo.total,
      },
      requestPayerName: true,
      disableWallets: ["googlePay", "browserCard"],
    });
    console.log(paymentRequest);
    const elements = this.stripe.elements();
    const prButton = elements.create('paymentRequestButton', {
      paymentRequest: paymentRequest
    });

    paymentRequest.canMakePayment().then((result) => {
    console.log(result);
      if (result) {
        prButton.mount('#paymentRequestButton');
      } else {
        document.getElementById('paymentRequestButton').style.display = 'none';
      }
    });
  }
}
</script>
