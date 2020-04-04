<template>
  <section class="section">
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
      return this.$store.state.user.user;
    },
    phone() {
      return (this.user && this.user.phoneNumber);
    }
  },
  methods: {
    handleDismissed() {
      console.log("handleDismissed", auth.currentUser && auth.currentUser.phoneNumber);
      this.dismissed = true;
    }
  }
}
</script>
