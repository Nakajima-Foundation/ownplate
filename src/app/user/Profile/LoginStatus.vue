<template>
  <div>
    <!-- Login Status -->
    <div class="text-center">
      <div class="text-sm font-bold text-black/30">
        {{ $t("profile.loginStatus") }}
      </div>

      <div class="mt-2 mb-2 text-base font-bold">
        {{ loginStatus }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { parsePhoneNumber, formatNational } from "@/utils/phoneutil";

import { useUserStore } from "@/store/user";
import { useI18n } from "vue-i18n";

export default defineComponent({
  setup() {
    const userStore = useUserStore();
    const { t } = useI18n({ useScope: "global" });

    const loginStatus = computed(() => {
      if (userStore.user) {
        if (userStore.user.email) {
          const extra = userStore.isSuperAdmin ? "*admin" : "";
          return `${t("profile.status.email")}: ${userStore.user.email} ${extra}`;
        } else if (userStore.user.phoneNumber) {
          const number = parsePhoneNumber(userStore.user.phoneNumber);
          return `${t("profile.status.phone")}: ${formatNational(number)}`;
        } else if (userStore.user.uid.slice(0, 5) === "line:") {
          return t("profile.status.line");
        } else if (userStore.user.uid.slice(0, 5) === "liff:") {
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
