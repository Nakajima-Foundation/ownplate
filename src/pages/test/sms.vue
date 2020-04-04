<template>
  <section class="section">
    <h1>{{phone}}</h1>
    <phone-login
     v-show="!dismissed"
     v-on:dismissed="handleDismissed" />
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
    phone() {
      const user = this.$store.state.user.user;
      return (user && user.phoneNumber);
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
