<template>
  <div>
    <div class="mt-6 text-center text-xl font-bold text-black text-opacity-40">
      {{ $t("admin.smaregi.authenticating") }}
    </div>
    <o-loading :is-full-page="false" :active="isValidating"></o-loading>
    <div v-if="error">
      <div class="flex space-x-4">
        <back-button url="/admin/restaurants/" />
      </div>

      {{ $t("admin.smaregi.authenticationError") }}
    </div>
  </div>
</template>

<script>
import { smaregiAuth } from "@/lib/firebase/functions";
import { smaregi } from "@/config/project";

import BackButton from "@/components/BackButton.vue";

export default {
  components: {
    BackButton,
  },
  data() {
    return {
      isValidating: false,
      error: false,
    };
  },
  async mounted() {
    if (this.code) {
      try {
        this.isValidating = true;
        const { data } = await smaregiAuth({
          code: this.code,
        });
        console.log("smaregiAuth", data);
        if (data.result) {
          this.$router.push("/admin/smaregi/index");
        } else {
          this.error = true;
        }
      } finally {
        this.isValidating = false;
      }
    }
  },
  computed: {
    code() {
      return this.$route.query.code;
    },
  },
};
</script>
