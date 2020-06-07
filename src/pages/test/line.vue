<template>
  <section class="section">
    <h1 class="m-b-8">Line Test</h1>
    <div v-if="user">
      <p>uid:{{user.uid}}</p>
      <p>displayName:{{user.displayName}}</p>
      <p>phone:{{user.phoneNumber}}</p>
      <p>email:{{user.email}}</p>
      <p>photoURL:{{user.photoURL}}</p>
    </div>
    <p class="m-t-16 m-b-16">
      <a :href="lineAuth">Line Login</a>
    </p>
    <p>
      <a href="https://lin.ee/1tEaDEpHn">
        <img
          src="https://scdn.line-apps.com/n/line_add_friends/btn/ja.png"
          alt="Add friend"
          height="36"
          border="0"
        />
      </a>
    </p>
  </section>
</template>

<script>
// https://firebase.googleblog.com/2016/11/authenticate-your-firebase-users-with-line-login.html
import { ownPlateConfig } from "@/config/project";
import { db, auth, firestore, functions } from "~/plugins/firebase.js";

export default {
  async mounted() {
    console.log(this.user);
    if (this.code) {
      console.log("****", this.code);
      const lineValidate = functions.httpsCallable("lineValidate");
      try {
        const { data } = await lineValidate({
          code: this.code,
          redirect_uri: this.redirect_uri,
          client_id: ownPlateConfig.line.LOGIN_CHANNEL_ID
        });
        console.log(data);
        if (data.customeToken) {
          try {
            const something = await auth.signInWithCustomToken(
              data.customeToken
            );
            console.log("line.mount", something);
            var user = auth.currentUser;
            const profile = {
              displayName: data.profile.displayName
            };
            if (data.profile.pictureUrl) {
              console.log("found pictureUrl", data.profile.pictureUrl);
              profile.photoURL = data.profile.pictureUrl;
            }
            user.updateProfile(profile);
            this.$store.commit("setUser", user);
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
    code() {
      return this.$route.query.code;
    },
    redirect_uri() {
      return location.origin + "/test/line";
    },
    lineAuth() {
      const query = {
        response_type: "code",
        client_id: ownPlateConfig.line.LOGIN_CHANNEL_ID,
        redirect_uri: this.redirect_uri,
        scope: "profile openid email",
        state: "s" + Math.random(),
        nonce: location.href
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
