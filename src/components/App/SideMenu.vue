<template>
  <o-sidebar
    :fullheight="true"
    :overlay="true"
    position="left"
    v-model:active="open"
  >
    <!-- Logo / Home -->
    <div class="mt-6 mb-4 text-center">
      <router-link :to="home_path">
        <img class="m-auto w-48" :src="`/${logo2}`" @click="handleClose()" />
      </router-link>
    </div>

    <!-- for owner before login | not implemented -->
    <div v-if="isAnonymous && false">
      <div class="font-bold text-black text-opacity-40 text-center mb-2">
        {{ $t("lp.forRestaurantOwner") }}
      </div>
    </div>

    <!-- Sign in for Any Users -->
    <div v-if="isAnonymous">
      <SideMenuButton
        text="button.login"
        icon="person"
        :to="base_path + '/u/profile'"
        @handleClose="handleClose()"
      />
    </div>

    <!-- Profile -->
    <div v-if="!isAnonymous">
      <SideMenuButton
        text="profile.title"
        icon="person"
        :to="base_path + '/u/profile'"
        @handleClose="handleClose()"
      />
    </div>

    <!-- Admin Top -->
    <div v-if="isAdmin">
      <SideMenuButton
        text="admin.news.adminTop"
        icon="home"
        to="/admin/restaurants"
        @handleClose="handleClose()"
      />
    </div>

    <!-- Order History -->
    <div v-if="isUser || inLiff">
      <SideMenuButton
        text="order.history"
        icon="history"
        :to="historyPage"
        @handleClose="handleClose()"
      />
    </div>

    <!-- Favorites -->
    <div class="text-center" v-if="isUser && !inLiff">
      <SideMenuButton
        text="find.likes"
        icon="favorite"
        to="/r/favorites"
        @handleClose="handleClose()"
      />
    </div>

    <!-- Find Restaurants -->
    <div v-if="(isUser || isAnonymous) && !inLiff">
      <SideMenuButton
        text="find.allRestaurants"
        icon="restaurant"
        to="/r"
        @handleClose="handleClose()"
      />
    </div>

    <!-- Sign up for admin -->
    <div class="mt-2 text-center" v-if="false">
      <router-link :to="base_path + '/admin/user/signup'">
        <div
          class="inline-flex h-12 w-56 items-center justify-center rounded-full bg-ownplate-yellow font-bold text-black text-opacity-90"
          @click="handleClose()"
        >
          <span>{{ $t("lp.signUpForFree") }}</span>
        </div>
      </router-link>
    </div>

    <!-- end of menu link -->

    <div v-if="isAnonymous">
      <!-- Go to User LP -->
      <div class="mt-4 text-center">
        <SideMenuText
          to="/home"
          text="menu.clickHereToOrder"
          @click="handleClose()"
        />
      </div>
    </div>

    <div v-if="isAnonymous">
      <div class="mt-6 font-bold text-black text-opacity-40 text-center mb-2">
        {{ $t("lp.forRestaurantOwner") }}
      </div>

      <SideMenuText to="/" text="lp.clickHereToSignup" @click="handleClose()" />

      <SideMenuText
        to="/admin/docs"
        text="button.linkToAdminDocs"
        icon="launch"
        @click="handleClose()"
      />

      <!-- News -->
      <SideMenuText to="/news" text="button.news" @click="handleClose()" />

      <!-- Terms -->
      <SideMenuText
        to="/terms/admin"
        text="menu.termsRestaurant"
        @click="handleClose()"
      />
    </div>

    <!-- Links for Admin -->
    <div v-if="isAdmin">
      <div class="mt-6 text-center">
        <!--Link to admin docs-->
        <SideMenuText
          to="/admin/docs"
          text="button.linkToAdminDocs"
          icon="launch"
          @click="handleClose()"
        />

        <!-- Terms for admin -->
        <SideMenuText
          to="/terms/admin"
          text="menu.termsRestaurant"
          @click="handleClose()"
        />

        <!-- News -->
        <SideMenuText to="/news" text="button.news" @click="handleClose()" />
      </div>
    </div>

    <!-- Separater -->
    <div class="mt-6" v-if="isAnonymous" />
    <div class="mt-4" v-if="isUser" />

    <!-- Terms for users -->
    <div v-if="isAnonymous || isUser">
      <SideMenuText
        :to="base_path + '/terms/user'"
        text="menu.termsUser"
        @click="handleClose()"
      />
    </div>

    <!-- Links for All -->
    <SideMenuText
      :to="base_path + '/privacy'"
      text="menu.privacy"
      @click="handleClose()"
    />
  </o-sidebar>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useLiffBasePath, regionalSetting, useUserData } from "@/utils/utils";
import SideMenuButton from "@/components/App/SideMenuButton.vue";
import SideMenuText from "@/components/App/SideMenuText.vue";

export default defineComponent({
  components: {
    SideMenuButton,
    SideMenuText,
  },
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
