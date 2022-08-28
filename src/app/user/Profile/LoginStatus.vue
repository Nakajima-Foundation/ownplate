<template>
  <div>
    <!-- Login Status -->
    <div class="text-center">
      <div class="text-sm font-bold text-black text-opacity-30">
        {{ $t("profile.loginStatus") }}
      </div>

      <div class="text-base font-bold mt-2">
        {{ loginStatus }}
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent, ref, computed, watch } from "@vue/composition-api";
import { parsePhoneNumber, formatNational } from "@/utils/phoneutil";

export default defineComponent({
  setup(_, ctx) {
    const user = computed(() => {
      return ctx.root.$store.state.user;
    });

    const loginStatus = computed(() => {
      if (user.value) {
        if (user.value.email) {
          const extra = ctx.root.$store.getters.isSuperAdmin ? "*admin" : "";
          return `${ctx.root.$t("profile.status.email")}: ${
            user.value.email
          } ${extra}`;
        } else if (user.value.phoneNumber) {
          const number = parsePhoneNumber(user.value.phoneNumber);
          return `${ctx.root.$t("profile.status.phone")}: ${formatNational(
            number
          )}`;
        } else if (user.value.uid.slice(0, 5) === "line:") {
          return ctx.root.$t("profile.status.line");
        } else if (user.value.uid.slice(0, 5) === "liff:") {
          return ctx.root.$t("profile.status.liff");
        }
        return ctx.root.$t("profile.status.unexpected");
      }
      return ctx.root.$t("profile.status.none");
    });
    return {
      loginStatus,
    };
  },
});
</script>
