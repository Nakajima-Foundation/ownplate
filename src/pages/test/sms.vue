<template>
  <div>
    <p>Hello World</p>
    <button id="signInButton">Foo</button>
  </div>
</template>

<script>
import { RecaptchaVerifier } from "~/plugins/firebase.js";

export default {
  mounted() {
    console.log("mounted", RecaptchaVerifier);
    window.recaptchaVerifier = new RecaptchaVerifier('signInButton', {
      'size': 'invisible',
      'callback': function(response) {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
      console.log("onSignInSubmit");
    }
});
  }
}
</script>