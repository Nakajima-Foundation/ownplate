<template>
  <div>
    <div class="t-h6 c-text-black-disabled align-center m-t-24">{{ $t('smaregi.authenticating')}}</div>
    <b-loading :is-full-page="false" :active="isValidating"></b-loading>
  </div>
</template>

<script>
import { functions } from "~/plugins/firebase.js";
import { smaregi } from "@/config/project";

export default {
  data() {
    return {
      isValidating:false,
    }
  },
  async mounted() {
    if (this.code) {
      try {
        const smaregiAuth = functions.httpsCallable("smaregiAuth");
        this.isValidating = true;
        const { data } = await smaregiAuth({
          code: this.code,
          client_id: smaregi.clientId,
        });
        console.log("smaregiAuth", data);

        this.$router.push("/admin/smaregi/index");
      } finally {
        this.isValidating = false;
      }
    }
  },
  computed: {
    code() {
      return this.$route.query.code;
    },
  }
};

</script>
