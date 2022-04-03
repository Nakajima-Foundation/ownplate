<template>
  <div>
    <div class="t-h6 c-text-black-disabled align-center m-t-24">
      {{ $t("admin.smaregi.authenticating") }}
    </div>
    <b-loading :is-full-page="false" :active="isValidating"></b-loading>
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

import BackButton from "@/components/BackButton";

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
          client_id: smaregi.clientId,
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
