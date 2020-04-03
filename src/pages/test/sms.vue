<template>
  <section class="section">
    <phone-login 
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
    }
  },
  mounted() {
  },
  computed: {
  },
  methods: {
    handleDismissed() {
      console.log("handleDismissed", auth.currentUser && auth.currentUser.phoneNumber);
    }
  }
}
</script>