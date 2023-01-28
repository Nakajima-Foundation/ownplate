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

    <!-- Phone Login-->
    <o-modal v-model:active="reLoginVisible" :width="488" scroll="keep">
      <div class="mx-2 my-6 rounded-lg bg-white p-6 shadow-lg">
        <phone-login
          v-on:dismissed="continueDelete"
          :relogin="user.phoneNumber"
        />
      </div>
    </o-modal>

    <!-- Loading -->
    <o-loading
      :is-full-page="false"
      :active="isDeletingAccount"
      :can-cancel="true"
    ></o-loading>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from "vue";
import PhoneLogin from "@/app/auth/PhoneLogin";
import { getAuth, deleteUser } from "firebase/auth";

import { accountDelete } from "@/lib/firebase/functions";

import { useStore } from "vuex";

export default defineComponent({
  components: {
    PhoneLogin,
  },
  setup() {
    const store = useStore();
    
    const isDeletingAccount = ref(false);
    const reLoginVisible = ref(false);

    const handleDeleteAccount = () => {
      store.commit("setAlert", {
        code: "profile.reallyDeleteAccount",
        callback: async () => {
          window.scrollTo(0, 0);
          reLoginVisible.value = true;
        },
      });
    };
    const continueDelete = async (result) => {
      reLoginVisible.value = false;
      if (result) {
        isDeletingAccount.value = true;
        try {
          const { data } = await accountDelete();
          console.log("deleteAccount", data);

          const auth = getAuth();
          const user = auth.currentUser;
          await deleteUser(user);
          console.log("deleted");
        } catch (error) {
          console.error(error);
        } finally {
          isDeletingAccount.value = false;
        }
      }
    };

    return {
      handleDeleteAccount,
      continueDelete,

      isDeletingAccount,
      reLoginVisible,
    };
  },
});
</script>
