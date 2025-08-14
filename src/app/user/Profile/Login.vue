<template>
  <div>
    <!-- Sign In as a User -->
    <div class="mt-2 text-center">
      <a
        class="border-op-teal inline-flex h-16 cursor-pointer items-center justify-center rounded-full border-2 px-6"
        @click.prevent="handleSignIn"
      >
        <i class="material-icons text-op-teal mr-2 text-2xl">local_mall</i>
        <div class="text-op-teal text-lg font-bold">
          <!-- omochikaeri -->
          {{ $t("profile.signIn") }}
        </div>
      </a>
    </div>

    <!-- Sign In as a Restaurant -->
    <div class="mt-4 text-center">
      <router-link to="/admin/user/signin">
        <div
          class="border-op-teal inline-flex h-16 items-center justify-center rounded-full border-2 px-6"
        >
          <i class="material-icons text-op-teal mr-2 text-2xl">store</i>
          <div class="text-op-teal text-lg font-bold">
            {{ $t("profile.signInRestaurant") }}
          </div>
        </div>
      </router-link>
    </div>

    <!-- Phone Login-->
    <t-modal
      :active="loginVisible"
      width="488"
      scroll="keep"
      @close="handleDismissed"
    >
      <div class="mx-2 my-6 rounded-lg bg-white p-6 shadow-lg">
        <phone-login v-on:dismissed="handleDismissed" />
      </div>
    </t-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import PhoneLogin from "@/app/auth/PhoneLogin.vue";

import { useStore } from "vuex";

export default defineComponent({
  components: {
    PhoneLogin,
  },
  setup() {
    const store = useStore();

    const loginVisible = ref(false);

    const user = computed(() => {
      return store.state.user;
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
    };
  },
});
</script>
