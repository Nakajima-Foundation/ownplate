<template>
  <section class="section">
    <p>{{ "date:" + $d($store.state.date) }}</p>
    <div v-show="user !== null">
      <h2>Phone: {{phone}}</h2>
      <p>Try "Sign Out" from the menu.</p>
    </div>
    <phone-login
     v-show="!user" />
  </section>
</template>

<script>
import PhoneLogin from "~/components/auth/PhoneLogin";
import { auth, authObject } from "~/plugins/firebase.js";

export default {
  components: {
    PhoneLogin
  },
  data() {
    return {
      dismissed: false
    }
  },
  mounted() {
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    phone() {
      return (this.user && this.user.phoneNumber);
    }
  }
}
</script>
