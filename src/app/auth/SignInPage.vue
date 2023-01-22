<template>
  <div class="mx-6 mt-6 lg:mx-auto lg:max-w-2xl">
    <!-- Note for the First User -->
    <div class="rounded-lg bg-green-600 bg-opacity-10 p-6">
      <div class="flex">
        <div>
          <i class="material-icons mr-4 flex-shrink-0 text-4xl text-green-600"
            >info</i
          >
        </div>

        <div class="flex-1 text-base font-bold">
          {{ $t("admin.encourageToReadManual.before") }}
          <a
            href="https://docs.omochikaeri.com/manuals/manual.pdf"
            target="_blank"
          >
            {{ $t("admin.encourageToReadManual.manualName") }}
          </a>
          {{ $t("admin.encourageToReadManual.after") }}
        </div>
      </div>
    </div>

    <!-- Sign In Card -->
    <div class="mt-6 rounded-lg bg-white p-6 shadow">
      <form @submit.prevent="onSignin">
        <div class="text-xl font-bold text-black text-opacity-30">
          {{ $t("admin.pleaseSignIn") }}
        </div>

        <!-- Email -->
        <div class="mt-4">
          <div class="text-sm font-bold">
            {{ $t("admin.email") }}
          </div>

          <div class="mt-1">
            <o-field
              :variant="errors.email ? 'danger' : 'success'"
              :message="errors.email && $t(errors.email[0])"
            >
              <o-input
                v-model="email"
                :placeholder="$t('admin.emailPlaceHolder')"
                maxlength="256"
              />
            </o-field>
          </div>
        </div>

        <!-- Password -->
        <div class="mt-2">
          <div class="text-sm font-bold">
            {{ $t("admin.password") }}
          </div>

          <div class="mt-1">
            <o-field
              :variant="errors.password ? 'danger' : 'success'"
              :message="errors.password && $t(errors.password[0])"
            >
              <o-input
                v-model="password"
                type="password"
                :placeholder="$t('admin.passwordPlaceHolder')"
                maxlength="30"
                password-reveal
              />
            </o-field>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="mt-2 text-center">
          <o-button @click="handleCancel" class="b-reset-tw mr-4 mb-2">
            <div
              class="inline-flex h-12 w-32 items-center justify-center rounded-full bg-black bg-opacity-5"
            >
              <div class="text-base font-bold text-black text-opacity-60">
                {{ $t("button.cancel") }}
              </div>
            </div>
          </o-button>

          <o-button @click="onSignin" class="b-reset-tw">
            <div
              class="inline-flex h-12 w-32 items-center justify-center rounded-full bg-op-teal shadow"
            >
              <div class="text-base font-bold text-white">
                {{ $t("button.next") }}
              </div>
            </div>
          </o-button>
        </div>

        <!-- Sign Up as a New User -->
        <div class="mt-6 text-center">
          <router-link to="/admin/user/signup">
            <div class="inline-flex items-center justify-center">
              <i class="material-icons mr-2 text-lg text-op-teal"
                >person_add_alt_1</i
              >
              <div class="text-sm font-bold text-op-teal">
                {{ $t("admin.pleaseSignUp") }}
              </div>
            </div>
          </router-link>
        </div>

        <!-- Forgot Password -->
        <div class="mt-6 text-center">
          <router-link to="/admin/user/reset">
            <div class="inline-flex items-center justify-center">
              <i class="material-icons mr-2 text-lg text-op-teal">help</i>
              <span class="text-sm font-bold text-op-teal">{{
                $t("admin.forgotPassword")
              }}</span>
            </div>
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from "vue";
import { auth } from "@/lib/firebase/firebase9";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useUser } from "@/utils/utils";

export default defineComponent({
  name: "Signin",
  metaInfo() {
    return {
      title: [this.defaultTitle, "Signin Admin"].join(" / "),
    };
  },
  setup(props, ctx) {
    const email = ref("");
    const password = ref("");
    const errors = ref({});

    const user = useUser();

    const redirectToAdminPage = () => {
      const redirect = ctx.root.$route.query["to"];
      const pathRegex = /^\/[a-zA-Z0-9-\_\/]+$/;

      if (redirect && pathRegex.test(redirect)) {
        ctx.root.$router.push(redirect);
      } else {
        ctx.root.$router.push("/admin/restaurants");
      }
    };

    if (ctx.root.isAdmin) {
      redirectToAdminPage();
    }

    watch(user, (newValue) => {
      console.log("user changed");
      if (newValue) {
        redirectToAdminPage();
      }
    });

    const handleCancel = () => {
      ctx.root.$router.push("/");
    };
    const onSignin = () => {
      ctx.root.$store.commit("setLoading", true);
      errors.value = {};
      signInWithEmailAndPassword(auth, email.value, password.value)
        .then((ret) => {
          console.log("onSignin success");
          ctx.root.$store.commit("setLoading", false);
        })
        .catch((error) => {
          console.log("onSignin failed", error.code, error.message);
          const errorCode = "admin.error.code." + error.code;
          if (
            error.code === "auth/wrong-password" ||
            error.code === "auth/internal-error"
          ) {
            errors.value = { password: [errorCode] };
          } else {
            errors.value = { email: [errorCode] };
          }
          ctx.root.$store.commit("setLoading", false);
        });
    };
    return {
      email,
      password,
      errors,

      handleCancel,
      onSignin,
    };
  },
});
</script>
