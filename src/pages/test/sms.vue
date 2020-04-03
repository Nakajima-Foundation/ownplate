<template>
  <div>
    <p>Hello World</p>
    <div id="signInButton"></div>
    <b-button @click="submit" :disabled="!readyToSendSMS">
      Send SMS
    </b-button>
  </div>
</template>

<script>
import { auth, authObject } from "~/plugins/firebase.js";

export default {
  data() {
    return {
      recaptchaVerifier : () => {},
      recaptchaVerified: false,
      recaptchaWidgetId: null,
      confirmationResult: null
    }
  },
  mounted() {
    this.recaptchaVerifier = new authObject.RecaptchaVerifier('signInButton', {
      'size': 'normal',
      'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log("verified", response);
        this.recaptchaVerified = true;
      }
    });
    this.recaptchaVerifier.render().then((widgetId) => {
      this.recaptchaWidgetId = widgetId;
      console.log("widdgetId", widgetId);
    });
  },
  computed: {
    readyToSendSMS() {
      return this.recaptchaVerified;
    }
  },
  methods: {
    submit() {
      console.log("submit");
      auth.signInWithPhoneNumber("+1", this.recaptchaVerifier)
        .then(function (confirmationResult) {
          // SMS sent. Prompt user to type the code from the message, then sign the
          // user in with confirmationResult.confirm(code).
          console.log("result", confirmationResult);
        }).catch(function (error) {
          // Error; SMS not sent
          // ...
          console.log("error", error);
        });
    }
  }
}
</script>