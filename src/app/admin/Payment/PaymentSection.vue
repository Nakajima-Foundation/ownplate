<template>
  <div class="m-t-24">
    <div class="t-h6 c-text-black-disabled m-b-8">{{ $t("admin.payment") }}</div>
    <div class="bg-surface r-8 d-low p-t-24 p-b-24">
      <!-- Stripe Not Connected -->
      <div v-if="!hasStripe">
        <div class="align-center">
          <div
            class="op-status c-status-red bg-status-red-bg"
          >{{ $t("admin.payments.statusNotConnected") }}</div>
        </div>
        <div
          class="p-l-24 p-r-24 m-t-24 t-body1 c-text-black-medium"
        >{{ $t("admin.payments.pleaseConnect") }}</div>
        <div class="align-center m-t-24">
          <a :href="stripeLink">
            <div class="op-button-medium primary" style="min-width: 288px;">
              <span class="p-l-16 p-r-16">
                {{
                $t("admin.payments.connectStripe")
                }}
              </span>
            </div>
          </a>
        </div>
      </div>

      <!-- Stripe Connected -->
      <div v-if="hasStripe">
        <div class="align-center">
          <div
            class="op-status c-status-green bg-status-green-bg"
          >{{ $t("admin.payments.statusConnected") }}</div>
        </div>
        <div class="align-center m-t-24">
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
        <div class="align-center m-t-16">
          <b-button
            @click="handlePaymentAccountDisconnect"
            class="b-reset op-button-text"
            :loading="isDisconnecting"
          >
            <i class="material-icons c-status-red">link_off</i>
            <span class="c-status-red">
              {{
              $t("admin.payments.disconnectStripe")
              }}
            </span>
          </b-button>
        </div>
      </div>

      <!-- In-store Payment -->
      <div class="align-center p-t-24">
        <b-checkbox v-model="inStorePayment">
          {{
          $t("admin.payments.enableInStorePayment")
          }}
        </b-checkbox>
      </div>
    </div>
  </div>
</template>

<script>
import { db, firestore, functions } from "~/plugins/firebase.js";
import { releaseConfig } from "~/plugins/config.js";
import { stripeConnect, stripeDisconnect } from "~/plugins/stripe.js";
import { ownPlateConfig } from "~/config/project";
export default {
  data() {
    return {
      paymentInfo: {}, // { stripe, inStore, ... }
      stripe_connnect_detacher: null,
      inStorePayment: false,
      isDisconnecting: false
    };
  },
  async mounted() {
    const code = this.$route.query.code;
    if (code) {
      try {
        const { data } = await stripeConnect({ code });
        console.log(data);
        this.$router.replace(location.pathname);
        // TODO: show connected view
      } catch (error) {
        // TODO: show error modal
        console.log(error);
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
    stripeLink() {
      return `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${
        process.env.STRIPE_CLIENT_ID
      }&scope=read_write&redirect_uri=${encodeURI(this.redirectURI)}`;
    },
    hasStripe() {
      return !!this.paymentInfo.stripe;
    }
  },
  methods: {
    async handlePaymentAccountDisconnect() {
      this.$store.commit("setAlert", {
        code: "admin.payments.reallyDisconnectStripe",
        callback: async () => {
          try {
            this.isDisconnecting = true;
            const { data } = await stripeDisconnect({
              STRIPE_CLIENT_ID: process.env.STRIPE_CLIENT_ID
            });
            console.log(data);
            // TODO: show connected view
          } catch (error) {
            // TODO: show error modal
            console.error(error, error.details);
          } finally {
            this.isDisconnecting = false;
          }
        }
      });
    }
  }
};
</script>
