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
  data() {
    return {
      stripe: getAppleStripeInstance(),
      amount: 1000
    };
  },
  mounted() {
    const paymentRequest = this.stripe.paymentRequest({
      country: 'JP',
      currency: 'jpy',
      total: {
        label: 'Demo total',  // 支払いラベルを指定
        amount: this.amount,  // 支払い金額を指定
      },
      requestPayerName: true,
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
