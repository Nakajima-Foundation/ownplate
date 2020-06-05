<template>
  <section class="section">
    <p>{{ "date:" + $d(date) + " " + (date.getMinutes()) }}</p>
    <div v-show="user !== null">
      <h2>Phone: {{phone}}</h2>
      <p>Try "Sign Out" from the menu.</p>
    </div>
    <phone-login v-show="!user" />
  </section>
</template>

<script>
import PhoneLogin from "~/app/auth/PhoneLogin";
import { auth, authObject } from "~/plugins/firebase.js";

export default {
  components: {
    PhoneLogin
  },
  data() {
    return {
      dismissed: false
    };
  },
  mounted() {
    console.log(this.$store.state.date);
  },
  computed: {
    date() {
      return this.$store.state.date;
    },
    phone() {
      return this.user && this.user.phoneNumber;
    }
  }
};
</script>
