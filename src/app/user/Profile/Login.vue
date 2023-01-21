<template>
  <div>
    <!-- Sign In as a User -->
    <div class="mt-6 text-center">
      <a
        class="inline-flex h-16 items-center justify-center rounded-full border-2 border-op-teal px-6"
        @click.prevent="handleSignIn"
      >
        <i class="material-icons mr-2 text-2xl text-op-teal">local_mall</i>
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
          class="inline-flex h-16 items-center justify-center rounded-full border-2 border-op-teal px-6"
        >
          <i class="material-icons mr-2 text-2xl text-op-teal">store</i>
          <div class="text-lg font-bold text-op-teal">
            {{ $t("profile.signInRestaurant") }}
          </div>
        </div>
      </router-link>
    </div>

    <!-- Phone Login-->
    <o-modal :active.sync="loginVisible" :width="488" scroll="keep">
      <div class="mx-2 my-6 rounded-lg bg-white p-6 shadow-lg">
        <phone-login v-on:dismissed="handleDismissed" />
      </div>
    </o-modal>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from "vue";
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
