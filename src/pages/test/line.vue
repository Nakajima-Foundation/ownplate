<template>
  <section class="section">
    <h1 class="m-b-8">Line Test</h1>
    <div v-if="user">
      <p>uid:{{user.uid}}</p>
      <p>displayName:{{user.displayName}}</p>
      <p>phone:{{user.phone}}</p>
      <p>email:{{user.email}}</p>
    </div>
    <a :href="lineAuth">Line Login</a>
  </section>
</template>

<script>
// https://firebase.googleblog.com/2016/11/authenticate-your-firebase-users-with-line-login.html
import { ownPlateConfig } from "@/config/project";
import { db, auth, firestore, functions } from "~/plugins/firebase.js";

export default {
  async mounted() {
    if (this.code) {
      console.log("****", this.code);
      const lineValidate = functions.httpsCallable("lineValidate");
      try {
        const { data } = await lineValidate({
          code: this.code,
          redirect_uri: this.redirect_uri,
          client_id: ownPlateConfig.LINE_CHANNEL_ID
        });
        console.log(data);
        if (data.customeToken) {
          try {
            const user = await auth.signInWithCustomToken(data.customeToken);
            console.log("line.mount", user);
          } catch (error) {
            console.error(error);
          }
        }
      } catch (error) {
        console.error(error.message, error.details);
      }
    }
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    code() {
      return this.$route.query.code;
    },
    redirect_uri() {
      return location.origin + "/test/line";
    },
    lineAuth() {
      const query = {
        response_type: "code",
        client_id: ownPlateConfig.LINE_CHANNEL_ID,
        redirect_uri: this.redirect_uri,
        scope: "profile openid",
        state: "s" + Math.random()
        //nonce: "u" + Math.random()
      };
      const queryString = Object.keys(query)
        .map(key => {
          return key + "=" + encodeURIComponent(query[key]);
        })
        .join("&");
      return `https://access.line.me/oauth2/v2.1/authorize?${queryString}`;
    }
  }
};
</script>
