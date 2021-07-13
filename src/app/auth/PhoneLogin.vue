<template>
  <div>
    <!-- Title -->
    <div class="text-xl font-bold text-black text-opacity-40">
      {{ $t("sms.signin") }}
    </div>

    <!-- Send SMS -->
    <form v-show="confirmationResult === null" @submit.prevent="handleSubmit">
      <div v-if="!relogin" class="mt-4">
        <!-- Country Code -->
        <div v-if="countries.length > 1">
          <div class="text-sm font-bold">
            {{ $t("sms.countryCode") }}
          </div>

          <div class="mt-2">
            <b-field>
              <b-select v-model="countryCode">
                <option
                  v-for="country in countries"
                  :value="country.code"
                  :key="country.code"
                  >{{ $t(country.name) }}</option
                >
              </b-select>
            </b-field>
          </div>
        </div>

        <!-- Phone Number -->
        <div class="mt-2">
          <div class="text-sm font-bold">
            {{ $t("sms.phonenumber") }}
          </div>

          <div class="mt-2">
            <b-field
              :type="hasError ? 'is-danger' : 'is-success'"
              :message="hasError ? $t(errors[0]) : $t('sms.notice')"
            >
              <b-input
                type="text"
                v-model="phoneNumber"
                v-on:input="validatePhoneNumber"
                maxlength="20"
                :placeholder="$t('sms.pleasetype')"
              />
            </b-field>
          </div>
          <div v-if="!isLocaleJapan">
            <div class="text-xs mt-2">
              For foreign customers:<br/>
              For mobile phones contracted in countries other than Japan, please add the country code to the phone number like +001-555-1111. You need to be able to receive SMS while roaming. <br/>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Buttons -->
      <div class="mt-4 text-center">
        <b-button
          id="signInButton"
          @click="$emit('dismissed', false)"
          class="b-reset-tw"
        >
          <div
            class="inline-flex justify-center items-center h-12 w-32 rounded-full bg-black bg-opacity-5"
          >
            <div class="text-base font-bold">{{ $t("button.cancel") }}</div>
          </div>
        </b-button>

        <b-button
          :loading="isLoading"
          @click="handleSubmit"
          :disabled="!readyToSendSMS"
          class="b-reset-tw ml-4"
        >
          <div
            class="inline-flex justify-center items-center h-12 w-32 rounded-full bg-op-teal shadow"
          >
            <div class="text-base font-bold text-white">
              {{ $t("sms.send") }}
            </div>
          </div>
        </b-button>
      </div>

      <!-- Terms of Use & Privacy Policy -->
      <div class="mt-6 text-xs">
        <div v-if="!isLocaleJapan">
          <span>By submitting this form, you agree to the</span>
          <router-link to="/terms/user" target="_blank">
            <span class="text-op-teal">Terms of Service</span>
          </router-link>
          <span>and</span>
          <router-link to="/privacy" target="_blank">
            <span class="text-op-teal">Privacy Policy</span>
          </router-link>
          <span>.</span>
        </div>

        <div v-else>
          <span>送信することで、</span>
          <router-link to="/terms/user" target="_blank">
            <span class="text-op-teal">利用規約</span>
          </router-link>
          <span>と</span>
          <router-link to="/privacy" target="_blank">
            <span class="text-op-teal">プライバシーポリシー</span>
          </router-link>
          <span>に同意したものとみなされます。</span>
        </div>
      </div>
    </form>

    <!-- Verification Code -->
    <form v-if="confirmationResult !== null" @submit.prevent="handleCode">
      <div class="mt-4">
        <!-- Enter Code -->
        <div>
          <div class="text-sm font-bold">
            {{ $t("sms.verificationCode") }}
          </div>

          <div class="mt-2">
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
        </div>

        <!-- Enter Name -->
        <div v-if="!this.relogin">
          <div class="text-sm font-bold">
            {{ $t("sms.userName") }}
          </div>

          <div class="mt-2">
            <b-field>
              <b-input
                type="text"
                v-model="name"
                maxlength="32"
                :placeholder="$t('sms.typeUserName')"
              />
            </b-field>
          </div>
        </div>
      </div>

      <!-- Submit Buttons -->
      <div class="mt-4 text-center">
        <b-button @click="$emit('dismissed', false)" class="b-reset-tw">
          <div
            class="inline-flex justify-center items-center h-12 w-32 rounded-full bg-black bg-opacity-5"
          >
            <div class="text-base font-bold">{{ $t("button.cancel") }}</div>
          </div>
        </b-button>

        <b-button
          :loading="isLoading"
          @click="handleCode"
          :disabled="!readyToSendVerificationCode"
          class="b-reset-tw ml-4"
        >
          <div
            class="inline-flex justify-center items-center h-12 w-32 rounded-full bg-op-teal shadow"
          >
            <div class="text-base font-bold text-white">
              {{ $t("sms.sendVerificationCode") }}
            </div>
          </div>
        </b-button>
      </div>
    </form>
  </div>
</template>

<script>
import { db, firestore, auth, authObject } from "~/plugins/firebase.js";
import * as Sentry from "@sentry/browser";

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
      size: "invisible",
      callback: response => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log("verified", response);
      }
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
      if ((this.phoneNumber ||"").startsWith("+")) {
        return this.phoneNumber;
      }
      return this.relogin || this.countryCode + this.phoneNumber;
    },
    countries() {
      return this.$store.getters.stripeRegion.countries;
    },
    readyToSendSMS() {
      return !this.hasError || this.relogin;
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
      const regex = /^\+?[0-9()\-]{8,20}$/;
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
        console.log(JSON.stringify(error));
        console.log("error", error.code);
        Sentry.captureException(error);
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
          const user = auth.currentUser; // paranoia: instead of this.$store.state.user;
          if (user) {
            await user.updateProfile({
              displayName: this.name
            });
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
        console.log(JSON.stringify(error));
        console.log("error", error.code);
        Sentry.captureException(error);
        this.errors = ["sms." + error.code];
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>
