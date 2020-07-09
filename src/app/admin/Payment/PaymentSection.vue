<template>
  <div class="m-t-24">
    <div class="t-h6 c-text-black-disabled m-b-8">{{ $t("admin.payment") }}</div>

    <div class="bg-surface r-8 d-low p-t-24 p-b-24" :style="cardStyle">
      <!-- Online Payment -->
      <div class="m-l-24 m-r-24">
        <div class="t-subtitle1 c-text-black-medium">{{ $t("admin.payments.onlinePayment") }}</div>
        <div class="m-t-8 t-body1 c-text-black-medium">{{ $t("admin.payments.pleaseConnect") }}</div>

        <!-- Stripe Not Connected -->
        <div v-if="!hasStripe">
          <!-- Stripe Connection Status -->
          <div class="align-center m-t-16">
            <div
              class="op-status c-status-red bg-status-red-bg"
            >{{ $t("admin.payments.statusNotConnected") }}</div>
          </div>

          <!-- Connect Button -->
          <div class="align-center m-t-16 m-b-24">
            <div class="op-button-small primary" @click="handleLinkStripe">
              <span>
                {{
                $t("admin.payments.connectStripe")
                }}
              </span>
            </div>
          </div>
        </div>

        <!-- Stripe Connected -->
        <div v-if="hasStripe">
          <!-- Stripe Connection Status -->
          <div class="align-center m-t-16">
            <div
              class="op-status c-status-green bg-status-green-bg"
            >{{ $t("admin.payments.statusConnected") }}</div>
          </div>

          <!-- Open Stripe -->
          <div class="align-center m-t-16">
            <a :href="dashboard" target="stripe">
              <div class="op-button-small secondary">
                <span class="c-primary">
                  {{
                  $t("admin.payments.openDashboard")
                  }}
                </span>
              </div>
            </a>
          </div>

          <!-- Disconnect Button -->
          <div class="align-center m-t-16">
            <b-button @click="handlePaymentAccountDisconnect" class="b-reset op-button-text">
              <i class="material-icons c-status-red">link_off</i>
              <span class="c-status-red">
                {{
                $t("admin.payments.disconnectStripe")
                }}
              </span>
            </b-button>
          </div>
        </div>
      </div>

      <hr class="m-l-24 m-r-24" />

      <!-- On-site Payment -->
      <div class="m-l-24 m-r-24">
        <div class="t-subtitle1 c-text-black-medium">{{ $t("admin.payments.onsitePayment") }}</div>
        <div class="m-t-8 t-body1 c-text-black-medium">{{ $t("admin.payments.pleaseCheck") }}</div>
        <div class="m-t-8 bg-form r-8 p-l-16 p-r-16 p-t-16 p-b-16">
          <span class="t-body2 c-status-red">{{ $t("admin.payments.onsitePaymentNote") }}</span>
        </div>

        <!-- On-site Payment Checkbox -->
        <div class="align-center m-t-24">
          <b-checkbox v-model="inStorePayment">
            {{
            $t("admin.payments.enableOnsitePayment")
            }}
          </b-checkbox>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db, firestore, functions } from "~/plugins/firebase.js";
import { releaseConfig } from "~/plugins/config.js";
import { stripeConnect, stripeDisconnect } from "~/plugins/stripe.js";
import { ownPlateConfig } from "~/config/project";
import * as Cookie from "cookie";

export default {
  data() {
    return {
      paymentInfo: {}, // { stripe, inStore, ... }
      stripe_connnect_detacher: null,
      inStorePayment: false
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
            error
          });
        } finally {
          this.$store.commit("setLoading", false);
          this.$router.replace(location.pathname);
        }
      }
    }

    const refPayment = db.doc(`/admins/${this.uid}/public/payment`);
    this.stripe_connnect_detacher = refPayment.onSnapshot(async snapshot => {
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
          inStore: false
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
          inStore: newValue
        });
      }
    },
    unsetWarning(newValue) {
      this.$emit("updateUnsetWarning", newValue)
    }
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
    cardStyle() {
      return this.unsetWarning
        ? { border: "solid 2px #b00020" }
        : {};
    },
    unsetWarning() {
      return !this.inStorePayment && !this.hasStripe;
    }
  },
  methods: {
    handleLinkStripe() {
      const params = {
        response_type: "code",
        scope: "read_write",
        client_id: process.env.STRIPE_CLIENT_ID,
        state: "s" + Math.random(),
        redirect_uri: encodeURI(this.redirectURI)
      };
      const queryString = Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join("&");

      const date = new Date();
      date.setTime(date.getTime() + 5 * 60 * 1000); // five minutes
      const cookie = `stripe_state=${
        params.state
      }; expires=${date.toUTCString()}; path=/`;
      console.log(cookie);
      document.cookie = cookie;

      location.href = `https://connect.stripe.com/oauth/authorize?${queryString}`;
    },
    async handlePaymentAccountDisconnect() {
      this.$store.commit("setAlert", {
        code: "admin.payments.reallyDisconnectStripe",
        callback: async () => {
          try {
            this.$store.commit("setLoading", true);
            const { data } = await stripeDisconnect({
              STRIPE_CLIENT_ID: process.env.STRIPE_CLIENT_ID
            });
            console.log(data);
            // TODO: show connected view
          } catch (error) {
            console.error(error, error.details);
            this.$store.commit("setErrorMessage", {
              code: "stripe.disconnect",
              error
            });
          } finally {
            this.$store.commit("setLoading", false);
          }
        }
      });
    }
  }
};
</script>
