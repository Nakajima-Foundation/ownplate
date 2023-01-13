<template>
  <div>
    <div class="mb-2 text-xl font-bold text-black text-opacity-40">
      {{ $t("admin.payment") }}
    </div>

    <div
      class="rounded-lg bg-white p-4 shadow"
      :class="unsetWarning ? 'border-2 border-solid border-red-700' : ''"
    >
      <!-- Warning Payment -->
      <div
        v-if="unsetWarning"
        class="mb-6 border-b-2 border-solid border-black border-opacity-10 pb-4"
        >
        <div class="mt-2 rounded-lg bg-red-700 bg-opacity-5 px-4 py-2">
          <span class="text-sm leading-none text-red-700 font-bold">
            {{  $t("admin.payments.required") }} 
          </span>
        </div>

      </div>
      
      <!-- Online Payment -->
      <div>
        <div class="pb-2 text-base font-bold text-black text-opacity-60">
          {{ $t("admin.payments.onlinePayment") }}
        </div>
        <div class="text-base text-black text-opacity-60">
          {{ $t("admin.payments.pleaseConnect") }}
        </div>

        <!-- Stripe Not Connected -->
        <div v-if="!hasStripe">
          <div class="mt-3 text-center text-sm font-bold text-red-700">
            {{ $t("admin.payments.statusNotConnected") }}
          </div>

          <div class="mt-2 text-center">
            <a
              @click="handleLinkStripe"
              class="inline-flex h-12 items-center rounded-full bg-op-teal px-8 shadow"
              ><span class="text-base font-bold text-white">{{
                $t("admin.payments.connectStripe")
              }}</span></a
            >
          </div>
        </div>

        <!-- Stripe Connected -->
        <div v-if="hasStripe">
          <div class="mt-3 text-center text-sm font-bold text-green-600">
            {{ $t("admin.payments.statusConnected") }}
          </div>

          <div class="mt-2 text-center">
            <a
              :href="dashboard"
              target="stripe"
              class="inline-flex h-12 items-center rounded-full border-2 border-op-teal px-6"
              ><span class="text-base font-bold text-op-teal">{{
                $t("admin.payments.openDashboard")
              }}</span></a
            >
          </div>

          <div class="mt-4 text-center">
            <a
              @click="handlePaymentAccountDisconnect"
              class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons mr-2 text-lg text-red-700">link_off</i>
              <span class="text-sm font-bold text-red-700">{{
                $t("admin.payments.disconnectStripe")
              }}</span>
            </a>
          </div>
        </div>
      </div>

      <!-- On-site Payment -->
      <div
        class="mt-4 border-t-2 border-solid border-black border-opacity-10 pt-4"
      >
        <div class="pb-2 text-base font-bold text-black text-opacity-60">
          {{ $t("admin.payments.onsitePayment") }}
        </div>
        <div class="text-base text-black text-opacity-60">
          {{ $t("admin.payments.pleaseCheck") }}
        </div>
        <div class="mt-2 rounded-lg bg-red-700 bg-opacity-5 px-4 py-2">
          <span class="text-sm leading-none text-red-700">{{
            $t("admin.payments.onsitePaymentNote")
          }}</span>
        </div>

        <div class="mt-5 text-center font-bold text-black text-opacity-60">
          <o-checkbox v-model="inStorePayment">
            {{ $t("admin.payments.enableOnsitePayment") }}
          </o-checkbox>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { db, firestore } from "@/plugins/firebase";
import { stripeConnect, stripeDisconnect } from "@/lib/stripe/stripe";
import { ownPlateConfig } from "@/config/project";
import * as Cookie from "cookie";

const client_id = ownPlateConfig.stripe.clientId;

export default {
  data() {
    return {
      paymentInfo: {}, // { stripe, inStore, ... }
      stripe_connnect_detacher: null,
      inStorePayment: false,
    };
  },
  async mounted() {
    const code = this.$route.query.code;
    if (code) {
      const state = this.$route.query.state;
      const cookies = Cookie.parse(document.cookie);
      //console.log("mounted", code, state, cookies.stripe_state);
      if (state === cookies?.stripe_state) {
        this.$store.commit("setLoading", true);
        try {
          const { data } = await stripeConnect({ code });
          console.log(data);
        } catch (error) {
          console.error(error);
          this.$store.commit("setErrorMessage", {
            code: "stripe.connect",
            error,
          });
        } finally {
          this.$store.commit("setLoading", false);
          this.$router.replace(location.pathname);
        }
      }
    }

    const refPayment = db.doc(`/admins/${this.uid}/public/payment`);
    this.stripe_connnect_detacher = refPayment.onSnapshot(async (snapshot) => {
      if (snapshot.exists) {
        this.paymentInfo = snapshot.data();
        this.inStorePayment = this.paymentInfo.inStore;
      } else {
        let stripe = null;
        // ---- Backward compatibility
        const refStripe = db.doc(`/admins/${this.uid}/public/stripe`);
        const stripeData = (await refStripe.get()).data();
        if (stripeData) {
          stripe = stripeData.stripeAccount;
        }
        // ---- End of Backward compatibility
        refPayment.set({
          stripe,
          inStore: false,
        });
      }
      this.$emit("updateUnsetWarning", this.unsetWarning);
    });
  },
  destroyed() {
    if (this.stripe_connnect_detacher) {
      this.stripe_connnect_detacher();
    }
  },
  watch: {
    inStorePayment(newValue) {
      if (newValue !== this.paymentInfo.inStore) {
        //console.log("************* inStorePayment change", newValue);
        const refPayment = db.doc(`/admins/${this.uid}/public/payment`);
        refPayment.update({
          inStore: newValue,
        });
      }
    },
    unsetWarning(newValue) {
      this.$emit("updateUnsetWarning", newValue);
    },
  },
  computed: {
    dashboard() {
      return ownPlateConfig.stripe.dashboard;
    },
    uid() {
      return this.$store.getters.uidAdmin;
    },
    redirectURI() {
      return `${location.protocol}//${location.host}${location.pathname}`;
    },
    hasStripe() {
      return !!this.paymentInfo.stripe;
    },
    // # Not In Use
    // cardStyle() {
    //   return this.unsetWarning ? { border: "solid 2px #b00020" } : {};
    // },
    unsetWarning() {
      return !this.inStorePayment && !this.hasStripe;
    },
  },
  methods: {
    handleLinkStripe() {
      const params = {
        response_type: "code",
        scope: "read_write",
        client_id: client_id,
        state: "s" + Math.random(),
        redirect_uri: encodeURI(this.redirectURI),
      };
      const queryString = Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .join("&");

      const date = new Date();
      date.setTime(date.getTime() + 5 * 60 * 1000); // five minutes
      const cookie = `stripe_state=${
        params.state
      }; expires=${date.toUTCString()}; path=/`;
      document.cookie = cookie;

      location.href = `https://connect.stripe.com/oauth/authorize?${queryString}`;
    },
    async handlePaymentAccountDisconnect() {
      this.$store.commit("setAlert", {
        code: "admin.payments.reallyDisconnectStripe",
        callback: async () => {
          try {
            this.$store.commit("setLoading", true);
            const { data } = await stripeDisconnect();
            console.log(data);
            // TODO: show connected view
          } catch (error) {
            console.error(error, error.details);
            this.$store.commit("setErrorMessage", {
              code: "stripe.disconnect",
              error,
            });
          } finally {
            this.$store.commit("setLoading", false);
          }
        },
      });
    },
  },
};
</script>
