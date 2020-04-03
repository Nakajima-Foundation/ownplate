<template>
  <section class="section">
    <form>
      <b-field 
        :type="hasError ? 'is-danger' : 'is-success'"
        :message="hasError ? $t(errors[0]) : $t('sms.notice')"
        :label="$t('sms.phonenumber')">
        <b-input type="text"
          v-model="phoneNumber"
          v-on:input="validate"
          maxlength="30"
          :placeholder="$t('sms.pleasetype')" />
      </b-field>
      <div 
        id="signInButton" 
        style="margin-bottom:0.5rem" />
      <input
        type="submit" 
        class="button" 
        @click="submit"
        :value="$t('sms.send')" 
        :disabled="!readyToSendSMS" />
    </form>
  </section>
</template>

<script>
import { auth, authObject } from "~/plugins/firebase.js";

export default {
  data() {
    return {
      phoneNumber:"",
      errors:[],
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
    },
    hasError() {
      return this.errors.length > 0
    }
  },
  methods: {
    validate() {
      console.log(this.phoneNumber);
    },
    submit() {
      console.log("submit");
      auth.signInWithPhoneNumber(this.phoneNumber, this.recaptchaVerifier)
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