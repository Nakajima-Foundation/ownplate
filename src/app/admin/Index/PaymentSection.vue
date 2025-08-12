<template>
  <div>
    <div class="mb-2 text-xl font-bold text-black/40">
      {{ $t("admin.payment") }}
    </div>

    <div
      class="rounded-lg bg-white p-4 shadow-sm"
      :class="unsetWarning ? 'border-2 border-solid border-red-700' : ''"
    >
      <!-- Warning Payment -->
      <div
        v-if="unsetWarning"
        class="mb-6 border-b-2 border-solid border-black/10 pb-4"
      >
        <div class="mt-2 rounded-lg bg-red-700/5 px-4 py-2">
          <span class="text-sm leading-none font-bold text-red-700">
            {{ $t("admin.payments.required") }}
          </span>
        </div>
      </div>

      <!-- Online Payment -->
      <div>
        <div class="pb-2 text-base font-bold text-black/60">
          {{ $t("admin.payments.onlinePayment") }}
        </div>
        <div class="text-base text-black/60">
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
              class="bg-op-teal inline-flex h-12 cursor-pointer items-center rounded-full px-8 shadow-sm"
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
              class="border-op-teal inline-flex h-12 items-center rounded-full border-2 px-6"
              ><span class="text-op-teal text-base font-bold">{{
                $t("admin.payments.openDashboard")
              }}</span></a
            >
          </div>

          <div class="mt-4 text-center">
            <a
              @click="handlePaymentAccountDisconnect"
              class="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-black/5 px-4"
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
      <div class="mt-4 border-t-2 border-solid border-black/10 pt-4">
        <div class="pb-2 text-base font-bold text-black/60">
          {{ $t("admin.payments.onsitePayment") }}
        </div>
        <div class="text-base text-black/60">
          {{ $t("admin.payments.pleaseCheck") }}
        </div>
        <div class="mt-2 rounded-lg bg-red-700/5 px-4 py-2">
          <span class="text-sm leading-none text-red-700">{{
            $t("admin.payments.onsitePaymentNote")
          }}</span>
        </div>

        <div class="mt-5 text-center font-bold text-black/60">
          <Checkbox v-model="inStorePayment">
            {{ $t("admin.payments.enableOnsitePayment") }}
          </Checkbox>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
  watch,
  computed,
} from "vue";
import { useStore } from "vuex";
import { useGeneralStore } from "@/store";
import { useRoute, useRouter } from "vue-router";
import { useDialogStore } from "@/store/dialog";

import { db } from "@/lib/firebase/firebase9";
import { doc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { stripeConnect, stripeDisconnect } from "@/lib/firebase/functions";
import { ownPlateConfig } from "@/config/project";
import { parse } from "cookie";

import { PaymentInfo } from "@/models/paymentInfo";
import Checkbox from "@/components/form/checkbox.vue";

const client_id = ownPlateConfig.stripe.clientId;

export default defineComponent({
  components: {
    Checkbox,
  },
  emits: ["updateUnsetWarning"],
  setup(_, context) {
    const store = useStore();
    const generalStore = useGeneralStore();
    const route = useRoute();
    const router = useRouter();
    const dialogStore = useDialogStore();

    const paymentInfo = ref<PaymentInfo>({}); // { stripe, inStore, ... }
    let stripe_connnect_detacher: Unsubscribe | null = null;
    const inStorePayment = ref<boolean | undefined>(false);

    onMounted(async () => {
      const code = route.query.code as string;
      if (code) {
        const state = route.query.state;
        const cookies = parse(document.cookie);
        //console.log("mounted", code, state, cookies.stripe_state);
        if (state === cookies?.stripe_state) {
          generalStore.setLoading(true);
          try {
            const { data } = await stripeConnect({ code });
            console.log(data);
          } catch (error: any) {
            console.error(error);
            dialogStore.setErrorMessage({
              code: "stripe.connect",
              error,
            } as any);
          } finally {
            generalStore.setLoading(false);
            router.replace(location.pathname);
          }
        }
      }
    });

    const uid = computed(() => {
      return store.getters.uidAdmin;
    });
    const hasStripe = computed(() => {
      return !!paymentInfo.value.stripe;
    });
    const unsetWarning = computed(() => {
      return !inStorePayment.value && !hasStripe.value;
    });

    const refPayment = doc(db, `/admins/${uid.value}/public/payment`);
    stripe_connnect_detacher = onSnapshot(refPayment, (snapshot) => {
      if (snapshot.exists()) {
        paymentInfo.value = snapshot.data();
        inStorePayment.value = paymentInfo.value.inStore;
      }
      context.emit("updateUnsetWarning", unsetWarning.value);
    });
    onUnmounted(() => {
      if (stripe_connnect_detacher) {
        stripe_connnect_detacher();
      }
    });
    watch(inStorePayment, (newValue) => {
      if (newValue !== paymentInfo.value.inStore) {
        //console.log("************* inStorePayment change", newValue);
        setDoc(
          refPayment,
          {
            inStore: newValue,
          },
          { merge: true },
        );
      }
    });
    watch(unsetWarning, (newValue) => {
      context.emit("updateUnsetWarning", newValue);
    });

    const dashboard = ownPlateConfig.stripe.dashboard;

    const redirectURI = `${location.protocol}//${location.host}${location.pathname}`;

    const handleLinkStripe = () => {
      const params = {
        response_type: "code",
        scope: "read_write",
        client_id: client_id,
        state: "s" + Math.random(),
        redirect_uri: encodeURI(redirectURI),
      };
      type TmpType = typeof params;
      const queryString = Object.keys(params)
        .map((key) => `${key}=${params[key as keyof TmpType]}`)
        .join("&");

      const date = new Date();
      date.setTime(date.getTime() + 5 * 60 * 1000); // five minutes
      const cookie = `stripe_state=${
        params.state
      }; expires=${date.toUTCString()}; path=/`;
      document.cookie = cookie;

      location.href = `https://connect.stripe.com/oauth/authorize?${queryString}`;
    };
    const handlePaymentAccountDisconnect = () => {
      store.commit("setAlert", {
        code: "admin.payments.reallyDisconnectStripe",
        callback: async () => {
          try {
            generalStore.setLoading(true);
            await stripeDisconnect();
            // TODO: show connected view
          } catch (error: any) {
            console.error(error, error.details);
            dialogStore.setErrorMessage({
              code: "stripe.disconnect",
              error,
            } as any);
          } finally {
            generalStore.setLoading(false);
          }
        },
      });
    };

    return {
      paymentInfo,
      inStorePayment,
      hasStripe,
      unsetWarning,
      dashboard,

      handlePaymentAccountDisconnect,
      handleLinkStripe,
    };
  },
});
</script>
