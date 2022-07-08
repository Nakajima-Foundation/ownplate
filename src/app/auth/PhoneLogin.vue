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
                >
                  {{ $t(country.name) }}
                </option>
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
                type="tel"
                autocomplete="tel"
                v-model="phoneNumber"
                v-on:input="validatePhoneNumber"
                maxlength="20"
                :placeholder="$t('sms.pleasetype')"
              />
            </b-field>
          </div>
          <div v-if="!isLocaleJapan">
            <div class="text-xs mt-2">
              For foreign customers:<br />
              For mobile phones contracted in countries other than Japan, please
              add the country code to the phone number like +1(555)555-111. You
              need to be able to receive SMS while roaming. <br />
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
        <TermsAndPolicy />
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
                type="tel"
                v-model="verificationCode"
                v-on:input="validateVerificationCode"
                maxlength="6"
                :placeholder="$t('sms.typeVerificationCode')"
              />
            </b-field>
          </div>
        </div>

        <!-- Enter Name -->
        <div v-if="!relogin">
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
import {
  defineComponent,
  ref,
  watch,
  computed,
  onMounted,
} from "@vue/composition-api";

import { db, auth } from "@/lib/firebase/firebase9";
import {
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  collection,
  addDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { stripeRegion } from "@/utils/utils";
import moment from "moment";
import * as Sentry from "@sentry/vue";

import TermsAndPolicy from "@/app/auth/TermsAndPolicy.vue";

export default defineComponent({
  components: {
    TermsAndPolicy,
  },
  props: {
    relogin: {
      type: String,
    },
  },
  emits: ["dismissed"],
  setup(props, ctx) {
    const countries = stripeRegion.countries;

    const isLoading = ref(false);
    const countryCode = countries[0].code || "+1";
    const phoneNumber = ref("");
    const errors = ref([]);
    const confirmationResult = ref(null);
    const verificationCode = ref("");
    const name = ref("");

    let recaptchaVerifier = null;

    onMounted(() => {
      recaptchaVerifier = new RecaptchaVerifier(
        "signInButton",
        {
          size: "invisible",
          callback: (response) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            console.log("verified", response);
          },
        },
        auth
      );
    });

    const hasError = computed(() => {
      return errors.value.length > 0;
    });
    const SMSPhoneNumber = computed(() => {
      if ((phoneNumber.value || "").startsWith("+")) {
        return phoneNumber.value;
      }
      return props.relogin || countryCode + phoneNumber.value;
    });
    const readyToSendSMS = computed(() => {
      return !hasError.value || props.relogin;
    });
    const readyToSendVerificationCode = computed(() => {
      return !hasError.value;
    });

    const validatePhoneNumber = () => {
      errors.value = [];
      const regex = /^\+?[0-9()\-]{8,20}$/;
      if (!regex.test(phoneNumber.value)) {
        errors.value = ["sms.invalidPhoneNumber"];
      }
    };

    const validateVerificationCode = () => {
      errors.value = [];
      const regex = /^[0-9]*$/;
      if (!regex.test(verificationCode.value)) {
        errors.value = ["sms.invalidValidationCode"];
      }
    };

    const handleSubmit = async () => {
      console.log("submit");
      try {
        isLoading.value = true;
        confirmationResult.value = await signInWithPhoneNumber(
          auth,
          SMSPhoneNumber.value,
          recaptchaVerifier
        );

        const path = moment().format("YYYY/MMDD");
        addDoc(collection(db, `/phoneLog/${path}`), {
          date: moment().format("YYYY-MM-DD"),
          month: moment().format("YYYYMM"),
          phoneNumber: SMSPhoneNumber.value,
          updated: serverTimestamp(),
        });
      } catch (error) {
        console.log(JSON.stringify(error));
        console.log("error", error.code);
        Sentry.captureException(error);
        errors.value = ["sms." + error.code];
      } finally {
        isLoading.value = false;
      }
    };
    const handleCode = async () => {
      console.log("handleCode");
      errors.value = [];
      try {
        isLoading.value = true;
        let result = await confirmationResult.value.confirm(
          verificationCode.value
        );
        // console.log("success!", result);
        if (name.value) {
          const user = auth.currentUser; // paranoia: instead of this.$store.state.user;
          if (user) {
            console.log(user);
            updateProfile(user, {
              displayName: name.value,
            });
          }
        }

        await setDoc(
          doc(db, `users/${result.user.uid}/private/profile`),
          {
            phoneNumber: result.user.phoneNumber,
            updated: serverTimestamp(),
          },
          { merge: true }
        );
        confirmationResult.value = null; // so that we can re-use this
        verificationCode.value = "";
        ctx.emit("dismissed", true);
      } catch (error) {
        console.log(JSON.stringify(error));
        console.log("error", error.code);
        Sentry.captureException(error);
        errors.value = ["sms." + error.code];
      } finally {
        isLoading.value = false;
      }
    };
    return {
      countries,
      isLoading,

      countryCode,
      phoneNumber,
      errors,
      confirmationResult,
      verificationCode,
      name,

      hasError,
      readyToSendSMS,
      readyToSendVerificationCode,

      validatePhoneNumber,
      validateVerificationCode,

      handleSubmit,
      handleCode,
    };
  },
});
</script>
