<template>
  <div>
    <!-- Login Status -->
    <div class="text-center">
      <div class="text-sm font-bold text-black text-opacity-30">
        {{ $t("profile.loginStatus") }}
      </div>

      <div class="mt-2 mb-2 text-base font-bold">
        {{ loginStatus }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { parsePhoneNumber, formatNational } from "@/utils/phoneutil";

import { useStore } from "vuex";
import { useI18n } from "vue-i18n";

export default defineComponent({
  setup() {
    const store = useStore();
    const { t } = useI18n({ useScope: 'global' });
    
    const user = computed(() => {
      return store.state.user;
    });

    const loginStatus = computed(() => {
      if (user.value) {
        if (user.value.email) {
          const extra = store.getters.isSuperAdmin ? "*admin" : "";
          return `${t("profile.status.email")}: ${
            user.value.email
          } ${extra}`;
        } else if (user.value.phoneNumber) {
          const number = parsePhoneNumber(user.value.phoneNumber);
          return `${t("profile.status.phone")}: ${formatNational(
            number
          )}`;
        } else if (user.value.uid.slice(0, 5) === "line:") {
          return t("profile.status.line");
        } else if (user.value.uid.slice(0, 5) === "liff:") {
          return t("profile.status.liff");
        }
        return t("profile.status.unexpected");
      }
      return t("profile.status.none");
    });
    return {
      loginStatus,
    };
  },
});
</script>
