<template>
  <div>
    <!-- Delete Account -->
    <div class="mt-4 text-center">
      <o-button @click="handleDeleteAccount" class="b-reset-tw">
        <div class="inline-flex items-center justify-center">
          <i class="material-icons mr-2 text-lg text-red-700">delete</i>
          <div class="text-sm font-bold text-red-700">
            {{ $t("profile.deleteAccount") }}
          </div>
        </div>
      </o-button>
    </div>

    <!-- Loading -->
    <o-loading
      :is-full-page="false"
      :active="isDeletingAccount"
      :can-cancel="true"
    ></o-loading>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import PhoneLogin from "@/app/auth/PhoneLogin.vue";
import { getAuth, deleteUser, signOut } from "firebase/auth";

import { accountDelete } from "@/lib/firebase/functions";

import { useStore } from "vuex";

export default defineComponent({
  components: {
    PhoneLogin,
  },
  setup() {
    const store = useStore();
    
    const isDeletingAccount = ref(false);

    const continueDelete = async () => {
      isDeletingAccount.value = true;
      try {
        const { data } = await accountDelete();
        // console.log("deleteAccount", data);
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          await deleteUser(user);
        }
        signOut(auth);
        console.log("deleted");
      } catch (error) {
        console.error(error);
      } finally {
        isDeletingAccount.value = false;
      }
    };
    const handleDeleteAccount = () => {
      store.commit("setAlert", {
        code: "profile.reallyDeleteAccount",
        callback: async () => {
          continueDelete();
          window.scrollTo(0, 0);
        },
      });
    };

    return {
      handleDeleteAccount,
      isDeletingAccount,
    };
  },
});
</script>
