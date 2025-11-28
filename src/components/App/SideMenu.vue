<template>
  <side-bar v-model:active="open">
    <!-- Logo / Home -->
    <div class="my-4 text-center">
      <router-link :to="home_path">
        <img class="m-auto w-48" :src="`/${logo2}`" @click="handleClose()" />
      </router-link>
    </div>

    <!-- for owner before login | not implemented -->
    <div v-if="isAnonymous && false">
      <div class="mb-2 text-center font-bold text-black/40">
        {{ $t("lp.forRestaurantOwner") }}
      </div>
    </div>

    <!-- Sign in for Any Users -->
    <div v-if="isAnonymous">
      <SideMenuButton
        text="button.login"
        icon="person"
        :to="base_path + '/u/profile'"
        @handle-close="handleClose()"
      />
    </div>

    <!-- Profile -->
    <div v-if="!isAnonymous">
      <SideMenuButton
        text="profile.title"
        icon="person"
        :to="base_path + '/u/profile'"
        @handle-close="handleClose()"
      />
    </div>

    <!-- Admin Top -->
    <div v-if="isAdmin">
      <SideMenuButton
        text="admin.news.adminTop"
        icon="home"
        to="/admin/restaurants"
        @handle-close="handleClose()"
      />
    </div>

    <!-- Order History -->
    <div v-if="isUser || inLiff">
      <SideMenuButton
        text="order.history"
        icon="history"
        :to="historyPage"
        @handle-close="handleClose()"
      />
    </div>

    <!-- Card Management (Restaurant-specific) -->
    <div v-if="isUser && restaurantId">
      <SideMenuButton
        text="restaurantCard.title"
        icon="credit_card"
        :to="`/r/${restaurantId}/card`"
        @handle-close="handleClose()"
      />
    </div>

    <!-- Favorites -->
    <div v-if="isUser && !inLiff">
      <SideMenuButton
        text="find.likes"
        icon="favorite"
        to="/r/favorites"
        @handle-close="handleClose()"
      />
    </div>

    <!-- Find Restaurants -->
    <div v-if="(isUser || isAnonymous) && !inLiff">
      <SideMenuButton
        text="find.allRestaurants"
        icon="restaurant"
        to="/r"
        @handle-close="handleClose()"
      />
    </div>

    <!-- Sign up for admin -->
    <div class="mt-2 text-center" v-if="false">
      <router-link :to="base_path + '/admin/user/signup'">
        <div
          class="bg-ownplate-yellow inline-flex h-12 w-56 items-center justify-center rounded-full font-bold text-black/90"
          @click="handleClose()"
        >
          <span>{{ $t("lp.signUpForFree") }}</span>
        </div>
      </router-link>
    </div>

    <!-- end of menu link -->

    <div v-if="isAnonymous">
      <!-- Go to User LP -->
      <div class="mt-4">
        <SideMenuText
          to="/home"
          text="menu.clickHereToOrder"
          @click="handleClose()"
        />
      </div>
    </div>

    <div v-if="isAnonymous">
      <div class="mt-4 mb-2 text-center font-bold text-black/40">
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
      <div class="mt-4 text-center">
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
    <div class="mt-4" v-if="isAnonymous || isUser" />

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
  </side-bar>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useLiffBasePath, regionalSetting, useUserData } from "@/utils/utils";
import SideMenuButton from "@/components/App/SideMenuButton.vue";
import SideMenuText from "@/components/App/SideMenuText.vue";
import SideBar from "@/components/App/SideBar.vue";

export default defineComponent({
  components: {
    SideMenuButton,
    SideMenuText,
    SideBar,
  },
  setup() {
    const open = ref(false);
    const route = useRoute();

    const liffBasePath = useLiffBasePath();
    const { inLiff, isAnonymous, isAdmin, isUser } = useUserData();

    const restaurantId = computed(() => {
      // Check if current route is a restaurant page (/r/:restaurantId/...)
      if (route.path.startsWith("/r/") && route.params.restaurantId) {
        return route.params.restaurantId as string;
      }
      return null;
    });

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
      restaurantId,

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
