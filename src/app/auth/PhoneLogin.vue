<template>
  <div>
    <div class="t-h6 c-text-black-disabled">{{ $t('sms.signin') }}</div>
    <!-- Send SMS -->
    <form v-show="confirmationResult === null" @submit.prevent="handleSubmit">
      <div v-if="!relogin" class="m-t-16">
        <!-- Country Code -->
        <div v-if="countries.length > 1">
          <div class="t-subtitle2 c-text-black-medium m-b-4">{{ $t('sms.countryCode') }}</div>
          <b-field>
            <b-select v-model="countryCode">
              <option
                v-for="country in countries"
                :value="country.code"
                :key="country.code"
              >{{ $t(country.name) }}</option>
            </b-select>
          </b-field>
        </div>

        <!-- Phone Number -->
        <div class="m-t-8">
          <div class="t-subtitle2 c-text-black-medium m-b-4">{{ $t('sms.phonenumber') }}</div>
          <b-field
            :type="hasError ? 'is-danger' : 'is-success'"
            :message="hasError ? $t(errors[0]) : $t('sms.notice')"
          >
            <b-input
              type="text"
              v-model="phoneNumber"
              v-on:input="validatePhoneNumber"
              maxlength="30"
              :placeholder="$t('sms.pleasetype')"
            />
          </b-field>
        </div>
      </div>

      <!-- reCAPTCHA -->
      <div id="signInButton" class="m-t-24"></div>

      <!-- Submit Buttons -->
      <div class="m-t-24 align-center">
        <b-button
          class="b-reset op-button-small tertiary m-r-16"
          @click="$emit('dismissed', false)"
        >
          <span>{{$t('button.cancel')}}</span>
        </b-button>
        <b-button
          class="b-reset op-button-small primary"
          :loading="isLoading"
          @click="handleSubmit"
          :disabled="!readyToSendSMS"
        >
          <span class="c-onprimary">{{$t('sms.send')}}</span>
        </b-button>
      </div>
    </form>

    <!-- Verification Code -->
    <form v-if="confirmationResult !== null" @submit.prevent="handleCode">
      <!-- Enter Code -->
      <div class="m-t-16">
        <div class="t-subtitle2 c-text-black-medium m-b-4">{{ $t('sms.verificationCode') }}</div>
        <b-field
          :type="hasError ? 'is-danger' : 'is-success'"
          :message="hasError ? $t(errors[0]) : ''"
        >
          <b-input
            type="text"
            v-model="verificationCode"
            v-on:input="validateVerificationCode"
            maxlength="6"
            :placeholder="$t('sms.typeVerificationCode')"
          />
        </b-field>
      </div>

      <!-- Enter Name -->
      <div>
        <div class="t-subtitle2 c-text-black-medium m-b-4">{{ $t('sms.userName') }}</div>
        <b-field>
          <b-input type="text" v-model="name" maxlength="32" :placeholder="$t('sms.typeUserName')" />
        </b-field>
      </div>

      <!-- Submit Buttons -->
      <div class="m-t-8 align-center">
        <b-button
          class="b-reset op-button-small tertiary m-r-16"
          @click="$emit('dismissed', false)"
        >
          <span>{{$t('button.cancel')}}</span>
        </b-button>
        <b-button
          class="b-reset op-button-small primary"
          :loading="isLoading"
          @click="handleCode"
          :disabled="!readyToSendVerificationCode"
        >
          <span class="c-onprimary">{{$t('sms.sendVerificationCode')}}</span>
        </b-button>
      </div>
    </form>
  </div>
</template>

<script>
import { db, firestore, auth, authObject } from "~/plugins/firebase.js";

export default {
  props: {
    relogin: {
      type: String
    }
  },
  data() {
    return {
      isLoading: false,
      countryCode: "+1",
      phoneNumber: "",
      errors: [],
      recaptchaVerifier: () => {},
      recaptchaVerified: false,
      recaptchaWidgetId: null,
      confirmationResult: null,
      verificationCode: "",
      name: "",
      result: {}
    };
  },
  mounted() {
    this.countryCode = this.countries[0].code;
    console.log("countryCode:mount", this.countryCode);
    this.recaptchaVerifier = new authObject.RecaptchaVerifier("signInButton", {
      size: "normal",
      callback: response => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log("verified", response);
        this.recaptchaVerified = true;
      }
    });
    this.recaptchaVerifier.render().then(widgetId => {
      this.recaptchaWidgetId = widgetId;
      console.log("widdgetId", widgetId);
    });
  },
  watch: {
    countries() {
      // to handle delayed initialization
      this.countryCode = this.countries[0].code;
      console.log("countryCode:watch", this.countryCode);
    }
  },
  computed: {
    SMSPhoneNumber() {
      return this.relogin || this.countryCode + this.phoneNumber;
    },
    countries() {
      return this.$store.getters.stripeRegion.countries;
    },
    readyToSendSMS() {
      return this.recaptchaVerified && (!this.hasError || this.relogin);
    },
    readyToSendVerificationCode() {
      return !this.hasError;
    },
    hasError() {
      return this.errors.length > 0;
    }
  },
  methods: {
    validatePhoneNumber() {
      this.errors = [];
      const regex = /^[0-9()\-]*$/;
      if (!regex.test(this.phoneNumber)) {
        this.errors.push("sms.invalidPhoneNumber");
      }
    },
    validateVerificationCode() {
      this.errors = [];
      const regex = /^[0-9]*$/;
      if (!regex.test(this.verificationCode)) {
        this.errors.push("sms.invalidValidationCode");
      }
    },
    async handleSubmit() {
      console.log("submit");
      try {
        this.isLoading = true;
        this.confirmationResult = await auth.signInWithPhoneNumber(
          this.SMSPhoneNumber,
          this.recaptchaVerifier
        );
        console.log("result", this.confirmationResult);
      } catch (error) {
        console.log("error", error);
        this.errors = ["sms." + error.code];
      } finally {
        this.isLoading = false;
      }
    },
    async handleCode() {
      console.log("handleCode");
      this.errors = [];
      try {
        this.isLoading = true;
        let result = await this.confirmationResult.confirm(
          this.verificationCode
        );
        console.log("success!", result);
        if (this.name) {
          await db.doc(`users/${result.user.uid}`).set(
            {
              name: this.name
            },
            { merge: true }
          );
          // Paranoia: To avoid race condition
          const user = this.$store.state.user;
          console.log("user", user);
          if (user) {
            console.log("name", user.name, this.name);
            user.name = this.name;
            this.$store.commit("setUser", user);
          }
        }

        await db.doc(`users/${result.user.uid}/private/profile`).set(
          {
            phoneNumber: result.user.phoneNumber,
            updated: firestore.FieldValue.serverTimestamp()
          },
          { merge: true }
        );
        this.confirmationResult = null; // so that we can re-use this
        this.verificationCode = "";
        this.$emit("dismissed", true);
      } catch (error) {
        console.log("error", error);
        this.errors = ["sms." + error.code];
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>
