<template>
  <div class="mx-6 mt-4 lg:mx-auto lg:max-w-2xl">
    <!-- Title -->
    <div class="text-xl font-bold text-black text-opacity-30">
      {{ $t("profile.title") }}
    </div>

    <!-- Card -->
    <div class="mt-2 rounded-lg bg-white p-6 shadow">
      <ProfileLoginStatus />

      <!-- Not Signed In -->
      <div v-if="!user">
        <ProfileLogin />
      </div>

      <!-- Signed In -->
      <div v-if="user && claims">
        <!-- For Takeout User -->
        <div v-if="user.phoneNumber">
          <!-- Order History -->
          <history-button />

          <!-- Favorites -->
          <favorite-button />

          <!-- Address -->
          <address-button />

          <ProfileStripe />

          <ProfileLine />
        </div>

        <!-- Sign Out -->
        <div class="mt-12 text-center" v-if="!isLiffUser">
          <a
            @click.prevent="handleSignOut"
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <div class="text-sm font-bold text-op-teal">
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
import ProfileStripe from "@/app/user/Profile/Stripe.vue";
import ProfileLine from "@/app/user/Profile/Line.vue";

import HistoryButton from "@/components/users/HistoryButton.vue";
import FavoriteButton from "@/components/users/FavoriteButton.vue";
import AddressButton from "@/components/users/AddressButton.vue";

import { defaultHeader } from "@/config/header";

import { useUserData } from "@/utils/utils";

export default defineComponent({
  components: {
    HistoryButton,
    FavoriteButton,
    AddressButton,
    ProfileLogin,
    ProfileDeleteAccount,
    ProfileLoginStatus,
    ProfileStripe,
    ProfileLine,
  },
  metaInfo() {
    return {
      title: [defaultHeader.title, "Profile"].join(" / "),
    };
  },
  setup() {
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
