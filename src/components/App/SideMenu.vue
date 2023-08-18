<template>
  <o-sidebar
    :fullheight="fullheight"
    :fullwidth="fullwidth"
    :overlay="overlay"
    :right="right"
    v-model:open="open"
  >
    <!-- Logo / Home -->
    <div class="mt-6 mb-4 text-center">
      <router-link :to="home_path">
        <img class="m-auto w-48" :src="`/${logo2}`" @click="handleClose()" />
      </router-link>
    </div>

    <!--ToDo この<div> ログイン前のアドミン（飲食店LPまたはご利用手引きのページ(admin/docs)からメニューを押した場合）に表示-->
    <div v-if="!isAdmin && !isUser">
      <div class="font-bold text-black text-opacity-40 text-center mb-2">
        {{ $t("lp.forRestaurantOwner") }}
      </div>

      <!--Sign in for admin-->
      <div class="mt-2 text-center">
        <router-link :to="base_path + '/admin/user/signin'">
          <div
            class="inline-flex h-12 w-56 items-center justify-center rounded-full bg-op-teal font-bold text-white"
            @click="handleClose()"
          >
            <i class="material-icons mr-2">person</i>
            <span>{{ $t("button.login") }}</span>
          </div>
        </router-link>
      </div>

      <!--Sign up for admin-->
      <div class="mt-2 text-center">
        <router-link :to="base_path + '/admin/user/signup'">
          <div
            class="inline-flex h-12 w-56 items-center justify-center rounded-full bg-ownplate-yellow font-bold text-black text-opacity-90"
            @click="handleClose()"
          >
            <span>{{ $t("lp.signUpForFree") }}</span>
          </div>
        </router-link>
      </div>
    </div>

    <!--ToDo この<div> ログイン後のアドミン & ログイン後のユーザーに表示-->
    <div>
      <!-- Profile -->
      <div class="mt-2 text-center">
        <router-link :to="base_path + '/u/profile'">
          <div
            class="inline-flex h-12 w-56 items-center justify-center rounded-full bg-op-teal font-bold text-white"
            @click="handleClose()"
          >
            <i class="material-icons mr-2">person</i>
            <span>{{ $t("profile.title") }}</span>
          </div>
        </router-link>
      </div>
    </div>

    <!--ToDo この<div> ログイン前のユーザー（飲食店LPまたはご利用手引きのページ以外のページから訪れた全ての人）に表示-->
    <div>
      <!-- Sign in for Users -->
      <div class="mt-2 text-center">
        <router-link :to="base_path + '/u/profile'">
          <div
            class="inline-flex h-12 w-56 items-center justify-center rounded-full bg-op-teal font-bold text-white"
            @click="handleClose()"
          >
            <i class="material-icons mr-2">person</i>
            <span>{{ $t("button.login") }}</span>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Order History -->
    <div class="mt-2 text-center" v-if="isUser || inLiff">
      <router-link :to="historyPage">
        <div
          class="inline-flex h-12 w-56 items-center justify-center rounded-full bg-op-teal font-bold text-white"
          @click="handleClose()"
        >
          <i class="material-icons mr-2">history</i>
          <span>{{ $t("order.history") }}</span>
        </div>
      </router-link>
    </div>

    <!-- Favorites -->
    <div class="mt-2 text-center" v-if="isUser && !inLiff">
      <router-link to="/r/favorites">
        <div
          class="inline-flex h-12 w-56 items-center justify-center rounded-full bg-op-teal font-bold text-white"
          @click="handleClose()"
        >
          <i class="material-icons mr-2">favorite</i>
          <span>{{ $t("find.likes") }}</span>
        </div>
      </router-link>
    </div>

    <!--ToDo この<div> ログイン後のユーザー & ログイン前のユーザー（飲食店LPまたはご利用手引きのページ以外のページから訪れた全ての人）に表示-->
    <div>
      <!-- Find Restaurants -->
      <div class="mt-2 text-center" v-if="(isUser || isAnonymous) && !inLiff">
        <router-link to="/r">
          <div
            class="inline-flex h-12 w-56 items-center justify-center rounded-full bg-op-teal font-bold text-white"
            @click="handleClose()"
          >
            <i class="material-icons mr-2">restaurant</i>
            <span>{{ $t("find.allRestaurants") }}</span>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Admin Top -->
    <div class="mt-2 text-center" v-if="isAdmin">
      <router-link to="/admin/restaurants">
        <div
          class="inline-flex h-12 w-56 items-center justify-center rounded-full bg-op-teal font-bold text-white"
          @click="handleClose()"
        >
          <i class="material-icons mr-2">home</i>
          <span>{{ $t("admin.news.adminTop") }}</span>
        </div>
      </router-link>
    </div>

    <!--ToDo この<div> ログイン後のアドミン & ログイン前のアドミン（飲食店LPまたはご利用手引きのページ(admin/docs)からメニューを押した場合）に表示-->
    <!-- Links for Admin -->
    <div v-if="!isUser">
      <div class="mt-6 text-center">
        <!--Link to admin docs-->
        <router-link to="/admin/docs">
          <div class="mt-2 inline-flex items-center justify-center">
            <span class="text-sm text-op-teal font-bold">
              {{ $t("button.linkToAdminDocs") }}
            </span>
            <i class="material-icons ml-0.5 text-lg text-op-teal">launch</i>
          </div>
        </router-link>

        <!-- Terms for admin -->
        <div class="mt-2 text-center">
          <router-link to="/terms/admin">
            <div
              class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
              @click="handleClose()"
            >
              {{ $t("menu.termsRestaurant") }}
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!--ToDo この<div> ログイン後のユーザー & ログイン前のユーザー（飲食店LPまたはご利用手引きのページ以外のページから訪れた全ての人）に表示-->
    <!-- Links for Customer -->
    <div v-if="!isAdmin">
      <div class="mt-6 text-center">
        <!-- News -->
        <div class="mt-2 text-center">
          <router-link to="/news">
            <div
              class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
              @click="handleClose()"
            >
              {{ $t("button.news") }}
            </div>
          </router-link>
        </div>

        <!-- Terms for users -->
        <div class="mt-2 text-center">
          <router-link :to="base_path + '/terms/user'">
            <div
              class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
              @click="handleClose()"
            >
              {{ $t("menu.termsUser") }}
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Links for All -->
    <div>
      <!-- Privacy -->
      <div class="mt-2 text-center">
        <router-link :to="base_path + '/privacy'">
          <div
            class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
            @click="handleClose()"
          >
            {{ $t("menu.privacy") }}
          </div>
        </router-link>
      </div>
    </div>

    <!--ToDo この<div> ログイン前のアドミン（飲食店LPまたはご利用手引きのページ(admin/docs)からメニューを押した場合）に表示-->
    <div v-if="!isAdmin && !isUser">
      <!-- Go to User LP -->
      <div class="mt-12 text-center">
        <router-link to="/home">
          <div
            class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
            @click="handleClose()"
          >
            {{ $t("lp.clickHereToOrder") }}
          </div>
        </router-link>
      </div>
    </div>

    <!--ToDo この<div> ログイン前のユーザー（飲食店LPまたはご利用手引きのページ以外のページから訪れた全ての人）に表示-->
    <div v-if="!isAdmin && !isUser">
      <!-- Go to Admin LP -->
      <div class="mt-12 font-bold text-black text-opacity-40 text-center mb-2">
        {{ $t("lp.forRestaurantOwner") }}
      </div>
      <div class="mt-2 text-center">
        <router-link to="/">
          <div
            class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
            @click="handleClose()"
          >
            {{ $t("lp.clickHereToSignup") }}
          </div>
        </router-link>
      </div>
    </div>
  </o-sidebar>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useLiffBasePath, regionalSetting, useUserData } from "@/utils/utils";

export default defineComponent({
  setup() {
    const open = ref(false);

    const liffBasePath = useLiffBasePath();
    const { inLiff, isAnonymous, isAdmin, isUser } = useUserData();

    const home_path = computed(() => {
      // /liff/hoge or /admin/restaurants or /r
      return inLiff.value
        ? liffBasePath.value
        : isAdmin.value
        ? "/admin/restaurants/"
        : "/r";
    });

    const handleClose = () => {
      open.value = false;
    };
    const handleOpen = () => {
      open.value = true;
    };

    const logo2 = regionalSetting.Logo2;

    const base_path = computed(() => {
      // /liff/hoge or ''
      return inLiff.value ? liffBasePath.value : "";
    });
    const historyPage = computed(() => {
      return base_path.value + "/u/history";
    });

    return {
      overlay: true,
      fullheight: true,
      fullwidth: false,
      right: false,
      home_path,

      logo2,
      base_path,
      historyPage,

      open,
      handleClose,
      handleOpen,

      inLiff,
      isAnonymous,
      isAdmin,
      isUser,
    };
  },
});
</script>
