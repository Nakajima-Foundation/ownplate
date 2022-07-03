<template>
  <div>
    <div class="text-xl font-bold text-black text-opacity-40 mb-2">
      {{ $t("admin.payment") }}
    </div>

    <div
      class="bg-white shadow rounded-lg p-4"
      :class="unsetWarning ? 'border-red-700 border-2 border-solid' : ''"
    >
      <!-- Online Payment -->
      <div>
        <div class="text-base font-bold text-black text-opacity-60 pb-2">
          {{ $t("admin.payments.onlinePayment") }}
        </div>
        <div class="text-base text-black text-opacity-60">
          {{ $t("admin.payments.pleaseConnect") }}
        </div>

        <!-- Stripe Not Connected -->
        <div v-if="!hasStripe">
          <div class="text-sm font-bold text-red-700 text-center mt-2">
            {{ $t("admin.payments.statusNotConnected") }}
          </div>

          <div class="text-center mt-2">
            <a
              @click="handleLinkStripe"
              class="h-12 rounded-full bg-op-teal inline-flex items-center px-8 shadow"
              ><span class="text-white text-base font-bold">{{
                $t("admin.payments.connectStripe")
              }}</span></a
            >
          </div>
        </div>

        <!-- Stripe Connected -->
        <div v-if="hasStripe">
          <div class="text-sm font-bold text-green-600 text-center mt-2">
            {{ $t("admin.payments.statusConnected") }}
          </div>

          <div class="text-center mt-2">
            <a
              :href="dashboard"
              target="stripe"
              class="h-12 rounded-full inline-flex items-center px-6 border-2 border-op-teal"
              ><span class="text-op-teal text-base font-bold">{{
                $t("admin.payments.openDashboard")
              }}</span></a
            >
          </div>

          <div class="text-center mt-6">
            <a
              @click="handlePaymentAccountDisconnect"
              class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons text-lg text-red-700 mr-2">link_off</i>
              <span class="text-sm font-bold text-red-700">{{
                $t("admin.payments.disconnectStripe")
              }}</span>
            </a>
          </div>
        </div>
      </div>

      <!-- On-site Payment -->
      <div
        class="border-t-2 border-solid border-black border-opacity-10 pt-4 mt-4"
      >
        <div class="text-base font-bold text-black text-opacity-60 pb-2">
          {{ $t("admin.payments.onsitePayment") }}
        </div>
        <div class="text-base text-black text-opacity-60">
          {{ $t("admin.payments.pleaseCheck") }}
        </div>
        <div class="bg-black bg-opacity-5 rounded-lg p-4 mt-2">
          <span class="text-sm text-red-700">{{
            $t("admin.payments.onsitePaymentNote")
          }}</span>
        </div>

        <div class="text-center mt-4">
          <b-checkbox v-model="inStorePayment">
            {{ $t("admin.payments.enableOnsitePayment") }}
          </b-checkbox>
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
      console.log("mounted", code, state, cookies.stripe_state);
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
