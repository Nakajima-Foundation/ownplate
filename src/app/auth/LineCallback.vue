<template>
  <div>
    <div class="mt-4 text-center text-xl font-bold text-black/40">
      {{ $t("line.authenticating") }}
    </div>
    <o-loading :is-full-page="false" :active="isValidating"></o-loading>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

// https://firebase.googleblog.com/2016/11/authenticate-your-firebase-users-with-line-login.html
import { lineGuard } from "@/lib/line/line";
import { lineValidate } from "@/lib/firebase/functions";

import { useUserData } from "@/utils/utils";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();

    const code = route.query.code as string;
    const restaurantId = route.params.restaurantId as string | undefined;
    const redirect_uri =
      location.origin +
      "/callback/" +
      (restaurantId ? restaurantId + "/" : "") +
      "line";
    const isValidating = ref(false);
    const { user, isLineUser } = useUserData();

    if (code) {
      (async () => {
        try {
          isValidating.value = true;
          const { data } = await lineValidate({
            code,
            redirect_uri,
            restaurantId,
          });
          console.log("lineValidate", data);

          if (data.nonce && data.profile) {
            const state = route.query.state as string;
            const params = lineGuard(data.nonce, state);

            user.value
              .getIdTokenResult(true)
              .then((result: { claims: string }) => {
                store.commit("setCustomClaims", result.claims);
                console.log("isLineuser", isLineUser.value);
                if (isLineUser.value) {
                  // End-user case
                  router.push(params.pathname);
                } else {
                  // Restaurant operator case
                  router.push(
                    `${params.pathname}?userId=${
                      data.profile.userId
                    }&displayName=${encodeURIComponent(
                      data.profile.displayName,
                    )}&state=${state}`,
                  );
                }
              });
          } else {
            console.error("validatin failed", data);
            throw new Error("something is wrong");
          }
        } catch (error: any) {
          console.error(error.message, error.details);
          store.commit("setErrorMessage", {
            code: "line.validation",
            message2: "errorPage.message.line",
            error,
          });
        } finally {
          isValidating.value = false;
        }
      })();
    } else {
      router.push("/");
    }
    return {
      isValidating,
    };
  },
});
</script>
