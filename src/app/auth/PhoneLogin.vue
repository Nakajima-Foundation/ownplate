<template>
  <div>
    <!-- Title -->
    <div class="text-xl font-bold text-black/40">
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
            <o-field>
              <o-select v-model="countryCode">
                <option
                  v-for="country in countries"
                  :value="country.code"
                  :key="country.code"
                >
                  {{ $t(country.name) }}
                </option>
              </o-select>
            </o-field>
          </div>
        </div>

        <!-- Phone Number -->
        <div class="mt-2">
          <div class="text-sm font-bold">
            {{ $t("sms.phonenumber") }}
          </div>

          <div class="mt-2">
            <o-field
              :variant="hasError ? 'danger' : 'success'"
              :message="hasError ? $t(errors[0]) : $t('sms.notice')"
            >
              <o-input
                type="tel"
                autocomplete="tel"
                v-model="phoneNumber"
                maxlength="20"
                :placeholder="$t('sms.pleasetype')"
              />
            </o-field>
          </div>
          <div v-if="!isLocaleJapan">
            <div class="mt-2 text-xs">
              For foreign customers:<br />
              For mobile phones contracted in countries other than Japan, please
              add the country code to the phone number like +1(555)555-111. You
              need to be able to receive SMS while roaming. <br />
            </div>
          </div>
        </div>
      </div>
      <div v-if="relogin" class="mt-4 text-center text-xl font-bold">
        {{ $t("profile.reSendSMSforDeleteAccount") }}
      </div>
      <!-- Submit Buttons -->
      <div class="mt-4 text-center">
        <t-button
          id="signInButton"
          @click="$emit('dismissed', false)"
          :isCancel="true"
          class="mr-4 mb-2 inline-flex h-12 w-32 items-center justify-center rounded-full bg-black/5"
        >
          <div class="text-base font-bold text-black/60">
            {{ $t("button.cancel") }}
          </div>
        </t-button>

        <t-button
          id="button-send-tel"
          :isDisabled="!readyToSendSMS"
          :isLoading="isLoading"
          class="h-12 w-32 shadow-sm font-bold text-white"
        >
          {{ $t("sms.send") }}
        </t-button>
      </div>

      <!-- Terms of Use & Privacy Policy -->
      <div class="mt-4 text-xs" v-if="!relogin">
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
            <o-field
              :variant="hasError ? 'danger' : 'success'"
              :message="hasError ? $t(errors[0]) : ''"
            >
              <o-input
                inputmode="numeric"
                pattern="[0-9]*"
                autocomplete="one-time-code"
                v-model="verificationCode"
                maxlength="6"
                :placeholder="$t('sms.typeVerificationCode')"
              />
            </o-field>
          </div>
        </div>

        <!-- Enter Name -->
        <div v-if="!relogin">
          <div class="text-sm font-bold">
            {{ $t("sms.userName") }}
          </div>

          <div class="mt-2">
            <o-field>
              <o-input
                type="text"
                v-model="name"
                maxlength="32"
                :placeholder="$t('sms.typeUserName')"
                expanded
              />
            </o-field>
          </div>
        </div>
      </div>

      <!-- Submit Buttons -->
      <div class="mt-4 text-center">
        <t-button
          @click="$emit('dismissed', false)"
          isCancel="true"
          class="mr-4 mb-2 inline-flex h-12 w-32 items-center justify-center rounded-full bg-black/5"
        >
          {{ $t("button.cancel") }}
        </t-button>

        <t-button
          id="button-send-code"
          :isDisabled="!readyToSendVerificationCode"
          :isLoading="isLoading"
          class="h-12 w-32 shadow-sm font-bold text-white"
        >
          {{ $t("sms.sendVerificationCode") }}
        </t-button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, onMounted } from "vue";

import { db, auth } from "@/lib/firebase/firebase9";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
  ApplicationVerifier,
  ConfirmationResult,
} from "firebase/auth";

import {
  doc,
  collection,
  addDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { stripeRegion, useIsLocaleJapan } from "@/utils/utils";
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
    const errors = ref<string[]>([]);
    const confirmationResult = ref<ConfirmationResult | null>(null);
    const verificationCode = ref("");
    const name = ref("");

    let recaptchaVerifier: ApplicationVerifier | null = null;

    const isLocaleJapan = useIsLocaleJapan();
    onMounted(() => {
      recaptchaVerifier = new RecaptchaVerifier(auth, "signInButton", {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          // console.log("verified", response);
          console.log("verified");
        },
      });
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
      return (!hasError.value && phoneNumber.value.length > 5) || props.relogin;
    });
    const readyToSendVerificationCode = computed(() => {
      return !hasError.value;
    });

    watch(phoneNumber, () => {
      errors.value = [];
      const regex = /^\+?[0-9()-]{8,20}$/;
      if (!regex.test(phoneNumber.value)) {
        errors.value = ["sms.invalidPhoneNumber"];
      }
    });

    watch(verificationCode, () => {
      errors.value = [];
      const regex = /^[0-9]*$/;
      if (!regex.test(verificationCode.value)) {
        errors.value = ["sms.invalidValidationCode"];
      }
    });

    const handleSubmit = async () => {
      console.log("submit");
      try {
        isLoading.value = true;
        confirmationResult.value = await signInWithPhoneNumber(
          auth,
          SMSPhoneNumber.value,
          recaptchaVerifier as ApplicationVerifier,
        );

        const path = moment().format("YYYY/MMDD");
        addDoc(collection(db, `/phoneLog/${path}`), {
          date: moment().format("YYYY-MM-DD"),
          month: moment().format("YYYYMM"),
          phoneNumber: SMSPhoneNumber.value,
          updated: serverTimestamp(),
        });
      } catch (error: any) {
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
        const result = await (
          confirmationResult.value as ConfirmationResult
        ).confirm(verificationCode.value);
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
          { merge: true },
        );
        confirmationResult.value = null; // so that we can re-use this
        verificationCode.value = "";
        ctx.emit("dismissed", true);
      } catch (error: any) {
        // console.log(JSON.stringify(error));
        // console.log("error", error.code);
        if (
          !["auth/code-expired", "auth/invalid-verification-code"].includes(
            error.code,
          )
        ) {
          Sentry.captureException(error);
        }
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

      isLocaleJapan,

      handleSubmit,
      handleCode,
    };
  },
});
</script>
