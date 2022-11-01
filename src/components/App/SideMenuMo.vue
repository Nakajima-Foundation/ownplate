<template>
  <o-sidebar
    type="is-light"
    :fullheight="fullheight"
    :fullwidth="fullwidth"
    :overlay="overlay"
    :right="right"
    :open.sync="open"
  >
    <!-- Logo / Home -->
    <div class="mt-6 mb-4 text-center">
      <router-link :to="home_path">
        <img
          class="m-auto w-48"
          :src="moBaseUrl + '/images/assets/logo_horizontal.png'"
          @click="handleClose()"
        />
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
      <router-link :to="base_path + '/r/favorites'">
        <div
          class="inline-flex h-12 w-56 items-center justify-center rounded-full bg-op-teal font-bold text-white"
          @click="handleClose()"
        >
          <i class="material-icons mr-2">favorite</i>
          <span>{{ $t("find.favoriteShop") }}</span>
        </div>
      </router-link>
    </div>

    <!-- Find Restaurants -->
    <div class="mt-2 text-center" v-if="(isCustomer || isAnonymous) && !inLiff">
      <router-link :to="base_path">
        <div
          class="inline-flex h-12 w-56 items-center justify-center rounded-full bg-op-teal font-bold text-white"
          @click="handleClose()"
        >
          <i class="material-icons mr-2">restaurant</i>
          <span>{{ $t("find.shopList") }}</span>
        </div>
      </router-link>
    </div>

    <!-- Links for FAQ, Terms and Policy -->
    <div class="mt-4">
      <!-- FAQ -->
      <div class="mt-2 text-center">
        <router-link :to="base_path + '/faq'">
          <div
            class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
            @click="handleClose()"
          >
            {{ $t("menu.faq") }}
          </div>
        </router-link>
      </div>

      <!-- Terms -->
      <div class="mt-2 text-center">
        <router-link :to="base_path + '/terms'">
          <div
            class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
            @click="handleClose()"
          >
            {{ $t("menu.termsUser") }}
          </div>
        </router-link>
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
import { moBaseUrl } from "@/config/project";

import {
  useMoPrefix,
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

    const mo_prefix = useMoPrefix(ctx.root);

    const home_path = computed(() => {
      return "/" + mo_prefix.value;
    });

    const handleClose = () => {
      open.value = false;
    };
    const handleOpen = () => {
      open.value = true;
    };

    const base_path = computed(() => {
      return home_path.value;
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

      base_path,
      historyPage,
      moBaseUrl,

      open,
      handleClose,
      handleOpen,
    };
  },
});
</script>
