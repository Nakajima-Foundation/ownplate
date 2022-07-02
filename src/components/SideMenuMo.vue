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
      <router-link :to="home_path"> ロゴ！！ </router-link>
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
      <router-link :to="base_path + '/r/favorites'">
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
      <router-link :to="base_path">
        <div
          class="inline-flex justify-center items-center rounded-full h-12 w-56 bg-op-teal text-white font-bold"
          @click="handleClose()"
        >
          <i class="material-icons mr-2">restaurant</i>
          <span>{{ $t("find.allRestaurants") }}</span>
        </div>
      </router-link>
    </div>

    <!-- Links for Terms and Policy -->
    <div>
      <!-- Terms -->
      <div class="text-center mt-2">
        <router-link :to="base_path + '/terms'">
          <div
            class="inline-flex justify-center items-center text-sm font-bold text-op-teal"
            @click="handleClose()"
          >
            {{ $t("menu.termsUser") }}
          </div>
        </router-link>
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

    const logo2 = regionalSetting.Logo2;

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
