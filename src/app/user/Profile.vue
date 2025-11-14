<template>
  <div class="mx-6 mt-4 lg:mx-auto lg:max-w-2xl">
    <!-- Title -->
    <div class="text-xl font-bold text-black/30">
      {{ $t("profile.title") }}
    </div>

    <!-- Card -->
    <div class="mt-2 rounded-lg bg-white p-4 shadow-sm">
      <ProfileLoginStatus />

      <!-- Not Signed In -->
      <div v-if="!user">
        <ProfileLogin />
      </div>

      <!-- Signed In -->
      <div v-if="user && claims">
        <!-- For Email User -->
        <div v-if="user.email">
          <!-- TOTP Settings -->
          <ProfileTotpSettings />
        </div>

        <!-- For Takeout User -->
        <div v-if="user.phoneNumber">
          <!-- Order History -->
          <history-button />

          <!-- Favorites -->
          <favorite-button />

          <!-- Address -->
          <address-button />

          <!-- ProfileStripe -->

          <ProfileLine />
        </div>

        <!-- Sign Out -->
        <div class="mt-12 text-center" v-if="!isLiffUser">
          <a
            @click.prevent="handleSignOut"
            class="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-black/5 px-4"
          >
            <div class="text-op-teal text-sm font-bold">
              {{ $t("menu.signOut") }}
            </div>
          </a>
        </div>

        <!-- Delete Account and Phone Login -->
        <div v-if="user.phoneNumber">
          <ProfileDeleteAccount />
        </div>
      </div>
      <!-- end of Signed in -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { auth } from "@/lib/firebase/firebase9";
import { signOut } from "firebase/auth";

import ProfileLogin from "@/app/user/Profile/Login.vue";
import ProfileDeleteAccount from "@/app/user/Profile/DeleteAccount.vue";
import ProfileLoginStatus from "@/app/user/Profile/LoginStatus.vue";
import ProfileTotpSettings from "@/app/user/Profile/TotpSettings.vue";
// import ProfileStripe from "@/app/user/Profile/Stripe.vue";
import ProfileLine from "@/app/user/Profile/Line.vue";

import HistoryButton from "@/components/form/HistoryButton.vue";
import FavoriteButton from "@/components/form/FavoriteButton.vue";
import AddressButton from "@/components/form/AddressButton.vue";

import { defaultHeader } from "@/config/header";

import { useUserData } from "@/utils/utils";
import { useHead } from "@unhead/vue";

export default defineComponent({
  components: {
    HistoryButton,
    FavoriteButton,
    AddressButton,
    ProfileLogin,
    ProfileDeleteAccount,
    ProfileLoginStatus,
    ProfileTotpSettings,
    // ProfileStripe,
    ProfileLine,
  },
  setup() {
    useHead(() => ({
      title: [defaultHeader.title, "Profile"].join(" / "),
    }));

    const handleSignOut = () => {
      signOut(auth);
    };
    const { isLiffUser, claims, user } = useUserData();
    return {
      claims,
      handleSignOut,

      user,
      isLiffUser,
    };
  },
});
</script>
