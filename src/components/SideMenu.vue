<template>
  <b-sidebar
    type="is-light"
    :fullheight="fullheight"
    :fullwidth="fullwidth"
    :overlay="overlay"
    :right="right"
    :open.sync="open"
  >
    <!-- Logo / Home -->
    <div class="text-center mt-6 mb-4">
      <router-link :to="home_path">
        <img class="w-48 m-auto" :src="`/${logo2}`" @click="handleClose()" />
      </router-link>
    </div>

    <!-- Profile -->
    <div class="text-center mt-2">
      <router-link :to="base_path + '/u/profile'">
        <div
          class="inline-flex justify-center items-center rounded-full h-12 w-56 bg-op-teal text-white font-bold"
          @click="handleClose()"
        >
          <i class="material-icons mr-2">person</i>
          <span>{{ $t("profile.title") }}</span>
        </div>
      </router-link>
    </div>

    <!-- Order History -->
    <div class="text-center mt-2" v-if="isCustomer || inLiff">
      <router-link :to="historyPage">
        <div
          class="inline-flex justify-center items-center rounded-full h-12 w-56 bg-op-teal text-white font-bold"
          @click="handleClose()"
        >
          <i class="material-icons mr-2">history</i>
          <span>{{ $t("order.history") }}</span>
        </div>
      </router-link>
    </div>

    <!-- Favorites -->
    <div class="text-center mt-2" v-if="isCustomer && !inLiff">
      <router-link to="/r/favorites">
        <div
          class="inline-flex justify-center items-center rounded-full h-12 w-56 bg-op-teal text-white font-bold"
          @click="handleClose()"
        >
          <i class="material-icons mr-2">favorite</i>
          <span>{{ $t("find.likes") }}</span>
        </div>
      </router-link>
    </div>

    <!-- Find Restaurants -->
    <div class="text-center mt-2" v-if="(isCustomer || isAnonymous) && !inLiff">
      <router-link to="/r">
        <div
          class="inline-flex justify-center items-center rounded-full h-12 w-56 bg-op-teal text-white font-bold"
          @click="handleClose()"
        >
          <i class="material-icons mr-2">restaurant</i>
          <span>{{ $t("find.allRestaurants") }}</span>
        </div>
      </router-link>
    </div>

    <!-- Admin Top -->
    <div class="text-center mt-2" v-if="isAdmin">
      <router-link to="/admin/restaurants">
        <div
          class="inline-flex justify-center items-center rounded-full h-12 w-56 bg-op-teal text-white font-bold"
          @click="handleClose()"
        >
          <i class="material-icons mr-2">home</i>
          <span>{{ $t("admin.news.adminTop") }}</span>
        </div>
      </router-link>
    </div>

    <!-- Links for Admin -->
    <div v-if="!isCustomer && !inLiff">
      <div class="text-center font-bold opacity-70 mt-6 mb-4">
        {{ $t("menu.forRestaurantOwner") }}
      </div>

      <!-- Manual -->
      <div class="text-center mt-2">
        <a
          href="https://docs.omochikaeri.com/manuals/manual.pdf"
          target="_blank"
          class="inline-flex justify-center items-center text-sm font-bold text-op-teal"
          @click="handleClose()"
        >
          {{ $t("menu.manualLink") }}
        </a>
      </div>

      <!-- Delivery Manual -->
      <div class="text-center mt-2">
        <a
          href="https://docs.omochikaeri.com/manuals/delivery.pdf"
          target="_blank"
          class="inline-flex justify-center items-center text-sm font-bold text-op-teal"
          @click="handleClose()"
        >
          {{ $t("menu.deliveryManualLink") }}
        </a>
      </div>

      <!-- Tips -->
      <div class="text-center mt-2">
        <a
          href="https://docs.omochikaeri.com/manuals/tips.pdf"
          target="_blank"
          class="inline-flex justify-center items-center text-sm font-bold text-op-teal"
          @click="handleClose()"
        >
          {{ $t("menu.tipsLink") }}
        </a>
      </div>

      <!-- Terms -->
      <div class="text-center mt-2">
        <router-link to="/terms/admin">
          <div
            class="inline-flex justify-center items-center text-sm font-bold text-op-teal"
            @click="handleClose()"
          >
            {{ $t("menu.termsRestaurant") }}
          </div>
        </router-link>
      </div>
    </div>

    <!-- Links for Customer -->
    <div v-if="!isAdmin">
      <div class="text-center font-bold opacity-70 mt-6 mb-4">
        {{ $t("menu.forCustomer") }}
      </div>

      <!-- Terms -->
      <div class="text-center mt-2">
        <router-link :to="base_path + '/terms/user'">
          <div
            class="inline-flex justify-center items-center text-sm font-bold text-op-teal"
            @click="handleClose()"
          >
            {{ $t("menu.termsUser") }}
          </div>
        </router-link>
      </div>
    </div>

    <!-- Links for All -->
    <div>
      <div class="text-center font-bold opacity-70 mt-6 mb-4">
        {{ $t("menu.forAllUser") }}
      </div>

      <!-- Privacy -->
      <div class="text-center mt-2">
        <router-link :to="base_path + '/privacy'">
          <div
            class="inline-flex justify-center items-center text-sm font-bold text-op-teal"
            @click="handleClose()"
          >
            {{ $t("menu.privacy") }}
          </div>
        </router-link>
      </div>
    </div>
  </b-sidebar>
</template>

<script>
import { defineComponent, ref, computed } from "@vue/composition-api";
import {
  useIsAdmin,
  useIsInLiff,
  useLiffBasePath,
  regionalSetting,
} from "@/utils/utils";

export default defineComponent({
  setup(_, ctx) {
    const open = ref(false);

    const isAdmin = useIsAdmin(ctx);
    const inLiff = useIsInLiff(ctx.root);
    const liffBasePath = useLiffBasePath(ctx.root);

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
      return inLiff.value ? liff_base_path.value : "";
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
    };
  },
});
</script>
