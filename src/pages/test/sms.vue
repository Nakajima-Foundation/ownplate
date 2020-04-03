<template>
  <div>
    <p>Hello World</p>
    <div id="signInButton"></div>
    <b-button @click="submit">
      Submit
    </b-button>
  </div>
</template>

<script>
import { auth, authObject } from "~/plugins/firebase.js";

export default {
  data() {
    return {
      recaptchaVerifier : () => {},
      recaptchaWidgetId: null
    }
  },
  mounted() {
    this.recaptchaVerifier = new authObject.RecaptchaVerifier('signInButton', {
      'size': 'normal',
      'callback': function(response) {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
      console.log("verified");
      }
    });
    this.recaptchaVerifier.render().then((widgetId) => {
      this.recaptchaWidgetId = widgetId;
      console.log("widdgetId", widgetId);
    });
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