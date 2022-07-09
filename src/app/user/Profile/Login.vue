<template>
  <div>
    <!-- Sign In as a User -->
    <div class="mt-6 text-center">
      <a
        class="inline-flex justify-center items-center h-16 px-6 rounded-full border-2 border-op-teal"
        @click.prevent="handleSignIn"
      >
        <i class="material-icons text-2xl text-op-teal mr-2">local_mall</i>
        <div class="text-lg font-bold text-op-teal" v-if="!isInMo">
          <!-- omochikaeri -->
          {{ $t("profile.signIn") }}
        </div>
        <div class="text-lg font-bold text-op-teal" v-if="isInMo">
          <!-- mobile order -->
          {{ $t("profile.signInMO") }}
        </div>
      </a>
    </div>

    <!-- Sign In as a Restaurant -->
    <div class="mt-6 text-center" v-if="!isInMo">
      <router-link to="/admin/user/signin">
        <div
          class="inline-flex justify-center items-center h-16 px-6 rounded-full border-2 border-op-teal"
        >
          <i class="material-icons text-2xl text-op-teal mr-2">store</i>
          <div class="text-lg font-bold text-op-teal">
            {{ $t("profile.signInRestaurant") }}
          </div>
        </div>
      </router-link>
    </div>

    <!-- Phone Login-->
    <b-modal :active.sync="loginVisible" :width="488" scroll="keep">
      <div class="mx-2 my-6 p-6 bg-white shadow-lg rounded-lg">
        <phone-login v-on:dismissed="handleDismissed" />
      </div>
    </b-modal>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from "@vue/composition-api";
import PhoneLogin from "@/app/auth/PhoneLogin";

import { useIsInMo } from "@/utils/utils";

export default defineComponent({
  components: {
    PhoneLogin,
  },
  setup(_, ctx) {
    const isInMo = useIsInMo(ctx.root);

    const loginVisible = ref(isInMo.value);

    const user = computed(() => {
      return ctx.root.$store.state.user;
    });
    watch(user, (newValue) => {
      if (newValue) {
        loginVisible.value = false;
      }
    });

    const handleDismissed = () => {
      console.log("handleDismissed");
      loginVisible.value = false;
    };
    const handleSignIn = () => {
      window.scrollTo(0, 0);
      loginVisible.value = true;
    };

    return {
      loginVisible,
      handleDismissed,
      handleSignIn,
      isInMo,
    };
  },
});
</script>
