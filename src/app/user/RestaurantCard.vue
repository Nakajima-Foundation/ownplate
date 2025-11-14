<template>
  <div class="mx-6 mt-6 lg:mx-auto lg:max-w-2xl">
    <!-- Page Title -->
    <div class="text-center">
      <div class="text-xl font-bold text-black/30">
        {{ $t("restaurantCard.title") }}
      </div>
      <div class="mt-2 text-sm text-black/60">
        {{ $t("restaurantCard.description") }}
      </div>
    </div>

    <!-- Restaurant Info -->
    <div v-if="shopInfo" class="mt-4 rounded-lg bg-white p-4 shadow-sm">
      <div class="flex items-center">
        <img
          v-if="shopInfo.restaurantProfilePhoto"
          :src="shopInfo.restaurantProfilePhoto"
          class="h-12 w-12 rounded-full object-cover"
        />
        <div class="ml-3">
          <div class="font-bold">{{ shopInfo.restaurantName }}</div>
        </div>
      </div>
    </div>

    <!-- Card Info -->
    <div class="mt-4 rounded-lg bg-white p-6 shadow-sm">
      <div class="text-center">
        <div class="text-sm font-bold text-black/30">
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

        <div v-if="storedCard" class="mt-4">
          <button @click="handleDeleteCard" class="cursor-pointer">
            <div
              class="inline-flex h-12 items-center justify-center rounded-full bg-red-600 px-6"
            >
              <i class="material-icons mr-2 text-lg text-white">delete</i>
              <div class="text-base font-bold text-white">
                {{ $t("profile.deleteCard") }}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Back Button -->
    <div class="mt-6 text-center">
      <router-link :to="`/r/${restaurantId}`">
        <div
          class="inline-flex h-12 w-32 cursor-pointer items-center justify-center rounded-full bg-black/5"
        >
          <div class="text-base font-bold text-black/60">
            {{ $t("button.back") }}
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { db } from "@/lib/firebase/firebase9";
import { doc, onSnapshot, getDoc, Unsubscribe } from "firebase/firestore";
import { stripeDeleteRestaurantCard } from "@/lib/firebase/functions";
import { useUserData } from "@/utils/utils";
import { useGeneralStore } from "@/store";
import { useDialogStore } from "@/store/dialog";
import moment from "moment";

export default defineComponent({
  name: "RestaurantCard",
  setup() {
    const route = useRoute();
    const generalStore = useGeneralStore();
    const dialogStore = useDialogStore();
    const { user } = useUserData();

    const restaurantId = computed(() => route.params.restaurantId as string);
    const shopInfo = ref<any>(null);
    const ownerUid = ref<string>("");
    const storedCard = ref<{ brand: string; last4: string; exp_month: number; exp_year: number } | null>(null);

    let detachStripe: Unsubscribe | null = null;

    const checkStripe = () => {
      if (detachStripe) {
        detachStripe();
        detachStripe = null;
      }
      if (user.value && ownerUid.value) {
        detachStripe = onSnapshot(
          doc(db, `/users/${user.value.uid}/owner/${ownerUid.value}/readonly/stripe`),
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
                  storedCard.value = stripeInfo.card;
                }
              }
            } else {
              storedCard.value = null;
            }
          },
          (e) => {
            console.log(e);
            console.log("stripe expired");
          },
        );
      }
    };

    // Fetch shop info to get owner UID
    const fetchShopInfo = async () => {
      try {
        const shopDoc = await getDoc(doc(db, `restaurants/${restaurantId.value}`));
        if (shopDoc.exists()) {
          shopInfo.value = shopDoc.data();
          ownerUid.value = shopInfo.value.uid;
          // Start monitoring card info once we have owner UID
          checkStripe();
        }
      } catch (e) {
        console.error("Failed to fetch shop info:", e);
      }
    };

    const handleDeleteCard = () => {
      dialogStore.setAlert({
        code: "profile.reallyDeleteCard",
        callback: async () => {
          console.log("handleDeleteCard for restaurant");
          generalStore.setLoading(true);
          try {
            await stripeDeleteRestaurantCard({ ownerUid: ownerUid.value });
            storedCard.value = null;
            console.log("stripeDeleteRestaurantCard succeeded");
          } catch (error) {
            console.error("Failed to delete card:", error);
          } finally {
            generalStore.setLoading(false);
          }
        },
      });
    };

    onMounted(() => {
      fetchShopInfo();
    });

    onUnmounted(() => {
      if (detachStripe) {
        detachStripe();
      }
    });

    return {
      restaurantId,
      shopInfo,
      storedCard,
      handleDeleteCard,
    };
  },
});
</script>
