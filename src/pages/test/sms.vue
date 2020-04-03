<template>
  <section class="section">
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
  },
  methods: {
    handleDismissed() {
      console.log("handleDismissed", auth.currentUser && auth.currentUser.phoneNumber);
      this.dismissed = true;
    }
  }
}
</script>
