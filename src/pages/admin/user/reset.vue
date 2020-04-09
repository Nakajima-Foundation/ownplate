<template>
  <section class="section">
    <div class="card block">
      <form 
        class="card-content"
        @submit.prevent="handleNext">
        <h2 class="p-big bold">
          {{ $t('admin.passwordReset') }}
        </h2>

        <b-field
          :type="errors.email ? 'is-danger' : 'is-success'"
          :message="errors.email && $t(errors.email[0])"
          :label="$t('admin.email')">
          <b-input
            v-model="email"
            :placeholder="$t('admin.emailPlaceHolder')"
            maxlength="256" />
        </b-field>

        <b-button
          @click="handleCancel">
          {{ $t('button.cancel') }}
        </b-button>
        <b-button
          type="is-primary"
          :disabled="Object.keys(errors).length > 0"
          @click="handleNext">
          {{ $t('button.next') }}
        </b-button>
        </p>
      </form>
    </div>
  </section>
</template>

<script>
import isEmail from 'validator/lib/isEmail';
import { auth } from "~/plugins/firebase.js";

export default {
  name: "Reset",
  data() {
    return {
      email: "",
      badEmail: "---invalid---"
    };
  },
  computed: {
    errors() {
      let errors = {};
      if (!isEmail(this.email)) {
        errors.email = ['admin.error.email.invalid'];        
      } else if (this.email === this.badEmail) {
        errors.email = ['admin.error.code.auth/user-not-found'];        
      }
      return errors;
    },
  },
  methods: {
    handleCancel() {
       this.$router.push("/admin/user/signin");
    },
    async handleNext() {
      console.log("handleNext");
      auth.sendPasswordResetEmail(this.email).then(() => {
        console.log("success");
      }).catch((error) => {
        console.log("failed", error);
        if (error.code === "auth/user-not-found") {
          this.badEmail = this.email;
        } else {
          this.badEmail = "---Invalid---";
        }
      });
    },
  }
};
</script>
<style lang="scss" scoped>
</style>
