<template>
  <!-- Credit Card Info -->
  <div class="mt-2 text-center">
    <div class="text-sm font-bold text-black text-opacity-30">
      {{ $t("profile.stripeInfo") }}
    </div>

    <div class="mt-2 text-base font-bold">
      <template v-if="storedCard">
        <div>{{ storedCard.brand }} ***{{ storedCard.last4 }}</div>
        <div>{{ storedCard.exp_month }}/{{ storedCard.exp_year }}</div>
      </template>
      <template v-else>
        {{ $t("profile.noCard") }}
      </template>
    </div>

    <div v-if="storedCard" class="mt-2">
      <o-button @click="handleDeleteCard" class="b-reset-tw">
        <div class="inline-flex items-center justify-center">
          <i class="material-icons mr-2 text-lg text-red-700">delete</i>
          <div class="text-sm font-bold text-red-700">
            {{ $t("profile.deleteCard") }}
          </div>
        </div>
      </o-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onUnmounted } from "vue";
import { db } from "@/lib/firebase/firebase9";
import { doc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { stripeDeleteCard } from "@/lib/firebase/functions";
import { useUserData } from "@/utils/utils";

import { useStore } from "vuex";
import moment from "moment";

export default defineComponent({
  setup() {
    const store = useStore();
    const { isLiffUser, user } = useUserData();

    const storedCard = ref<{ brand: string; last4: string } | null>(null);

    let detachStripe: Unsubscribe | null = null;
    const checkStripe = () => {
      if (detachStripe) {
        detachStripe();
        detachStripe = null;
      }
      if (user.value && (user.value.phoneNumber || isLiffUser.value)) {
        detachStripe = onSnapshot(
          doc(db, `/users/${user.value.uid}/readonly/stripe`),
          (snapshot) => {
            const stripeInfo = snapshot.data();
            if (stripeInfo && stripeInfo.card) {
              const date = ("00" + String(stripeInfo.card.exp_month)).slice(-2);
              const expire = moment(
                `${stripeInfo.card.exp_year}${date}01T000000+0900`,
              )
                .endOf("month")
                .toDate();
              if (
                stripeInfo.updatedAt &&
                stripeInfo.updatedAt.toDate() >
                  moment().subtract(180, "days").toDate()
              ) {
                if (expire > new Date()) {
                  storedCard.value = stripeInfo?.card;
                }
              }
            }
          },
          (e) => {
            console.log(e);
            console.log("stripe expired");
          },
        );
      }
    };

    const handleDeleteCard = () => {
      store.commit("setAlert", {
        code: "profile.reallyDeleteCard",
        callback: async () => {
          console.log("handleDeleteCard");
          store.commit("setLoading", true);
          try {
            const { data } = await stripeDeleteCard();
            storedCard.value = null;
            console.log("stripeDeleteCard", data);
          } catch (error) {
            console.error(error);
          } finally {
            store.commit("setLoading", false);
          }
        },
      });
    };
    watch(user, () => {
      checkStripe();
    });
    checkStripe();

    onUnmounted(() => {
      detachStripe && detachStripe();
    });

    return {
      storedCard,

      handleDeleteCard,
    };
  },
});
</script>
