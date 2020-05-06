<template>
  <div>
    <section class="section" style="margin-top:5rem;margin-bottom:5rem">
      <div class="card block">
        <div class="card-content">
          <p style="text-align:center; font-weight:bold; font-size:1.5em">
            <router-link to="/u/history">{{$t("order.history")}}</router-link>
          </p>
        </div>
      </div>
    </section>
    <b-modal :active.sync="loginVisible" :width="640">
      <div class="card">
        <div class="card-content">
          <phone-login v-on:dismissed="handleDismissed" />
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import PhoneLogin from "~/app/auth/PhoneLogin";

export default {
  data() {
    return {
      loginVisible: !this.$store.state.user
    };
  },
  components: {
    PhoneLogin
  },
  methods: {
    handleDismissed(success) {
      console.log("handleDismissed", success);
      if (success) {
        this.loginVisible = false;
      } else {
        this.$router.push("/");
      }
    }
  }
};
</script>
