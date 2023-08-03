<template>
  <o-sidebar
    :fullheight="fullheight"
    :fullwidth="fullwidth"
    :overlay="overlay"
    :right="right"
    :open.sync="open"
  >
    <!-- Logo / Home -->
    <div class="mt-6 mb-4 text-center">
      <router-link :to="home_path">
        <img class="m-auto w-48" :src="`/${logo2}`" @click="handleClose()" />
      </router-link>
    </div>

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

    <!-- Order History -->
    <div class="mt-2 text-center" v-if="isCustomer || inLiff">
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
    <div class="mt-2 text-center" v-if="isCustomer && !inLiff">
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

    <!-- Find Restaurants -->
    <div class="mt-2 text-center" v-if="(isCustomer || isAnonymous) && !inLiff">
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

    <!-- Links for Admin -->
    <div v-if="!isCustomer && !inLiff">
      <div class="mt-6 mb-4 text-center font-bold opacity-70">
        {{ $t("menu.forRestaurantOwner") }}
      </div>

      <!-- Manual -->
      <div class="mt-2 text-center">
        <a
          href="https://docs.omochikaeri.com/manuals/manual.pdf"
          target="_blank"
          class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
          @click="handleClose()"
        >
          {{ $t("menu.manualLink") }}
        </a>
      </div>

      <!-- Delivery Manual -->
      <div class="mt-2 text-center">
        <a
          href="https://docs.omochikaeri.com/manuals/delivery.pdf"
          target="_blank"
          class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
          @click="handleClose()"
        >
          {{ $t("menu.deliveryManualLink") }}
        </a>
      </div>

      <!-- Printer Manual -->
      <div class="mt-2 text-center">
        <a
          href="https://docs.omochikaeri.com/manuals/printer.pdf"
          target="_blank"
          class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
          @click="handleClose()"
        >
          {{ $t("menu.printerManualLink") }}
        </a>
      </div>
      
      <!-- Tips -->
      <div class="mt-2 text-center">
        <a
          href="https://docs.omochikaeri.com/manuals/tips.pdf"
          target="_blank"
          class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
          @click="handleClose()"
        >
          {{ $t("menu.tipsLink") }}
        </a>
      </div>

      <!-- Smaregi -->
      <div class="mt-2 text-center">
        <a
          href="https://docs.omochikaeri.com/manuals/smaregi.pdf"
          target="_blank"
          class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
          @click="handleClose()"
        >
          {{ $t("admin.thirdPartyService.smaregiManual") }}
        </a>
      </div>

      <!-- Terms -->
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

    <!-- Links for Customer -->
    <div v-if="!isAdmin">
      <div class="mt-6 mb-4 text-center font-bold opacity-70">
        {{ $t("menu.forCustomer") }}
      </div>

      <!-- Terms -->
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

    <!-- Links for All -->
    <div>
      <div class="mt-6 mb-4 text-center font-bold opacity-70">
        {{ $t("menu.forAllUser") }}
      </div>

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
  </o-sidebar>
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
    };
  },
});
</script>
