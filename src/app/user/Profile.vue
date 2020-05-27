<template>
  <section class="section">
    <h1>{{$t("profile.title")}}</h1>
    <b-field class="m-t-8" :label="$t('profile.loginStatus')">
      <p>{{loginStatus}}</p>
    </b-field>
    <div v-if="user">
      <!--b-field class="m-t-8" :label="$t('profile.displayName')">
        <p>{{displayName}}</p>
      </b-field-->
      <div v-if="user.phoneNumber">
        <b-field class="m-t-8" :label="$t('profile.lineConnection')">
          <p>{{lineConnection}}</p>
        </b-field>
        <b-field class="m-t-8" :label="$t('profile.lineFriend')">
          <p>{{lineFriend}}</p>
        </b-field>
        <b-button @click="handleVerify">Verify Friend</b-button>
        <b-button
          class="b-reset op-button-small"
          style="background:#18b900"
          tag="a"
          :href="lineAuth"
        >
          <i class="fab fa-line c-text-white-full m-l-24 m-r-8" style="font-size:24px" />
          <span class="c-text-white-full m-r-24">
            {{
            $t("line.notifyMe")
            }}
          </span>
        </b-button>
      </div>
    </div>
  </section>
</template>

<script>
import { parsePhoneNumber, formatNational } from "~/plugins/phoneutil.js";
import { db, firestore, functions } from "~/plugins/firebase.js";
import { ownPlateConfig } from "@/config/project";

export default {
  data() {
    return {
      isFriend: false
    };
  },
  created() {
    db.doc(`users/${this.user.uid}/private/line`)
      .get()
      .then(doc => {
        const data = doc.data();
        console.log(data);
        if (data) {
          this.isFriend = data.isFriend;
        }
      });
  },
  computed: {
    lineAuth() {
      const query = {
        response_type: "code",
        client_id: ownPlateConfig.line.LOGIN_CHANNEL_ID,
        redirect_uri: this.redirect_uri,
        scope: "profile openid email",
        bot_prompt: "aggressive",
        state: "s" + Math.random(), // LATER: Make it more secure
        nonce: location.pathname // HACK: Repurposing nonce
      };
      const queryString = Object.keys(query)
        .map(key => {
          return key + "=" + encodeURIComponent(query[key]);
        })
        .join("&");
      return `https://access.line.me/oauth2/v2.1/authorize?${queryString}`;
    },
    redirect_uri() {
      return location.origin + "/callback/line";
    },
    user() {
      return this.$store.state.user;
    },
    lineConnection() {
      return this.user?.claims?.line
        ? this.$t("profile.status.hasLine")
        : this.$t("profile.status.noLine");
    },
    lineFriend() {
      return this.isFriend
        ? this.$t("profile.status.isFriend")
        : this.$t("profile.status.noFriend");
    },
    displayName() {
      return this.user?.displayName || this.$t("profile.undefined");
    },
    loginStatus() {
      if (this.user) {
        console.log(this.user);
        if (this.user.email) {
          const extra = this.user?.claims.admin ? "*admin" : "";
          return `${this.$t("profile.status.email")}: ${
            this.user.email
          } ${extra}`;
        } else if (this.user.phoneNumber) {
          const number = parsePhoneNumber(this.user.phoneNumber);
          return `${this.$t("profile.status.phone")}: ${formatNational(
            number
          )}`;
        } else if (this.user.uid.slice(0, 5) === "line:") {
          return this.$t("profile.status.line");
        }
        return this.$t("profile.status.unexpected");
      }
      return this.$t("profile.status.none");
    }
  },
  methods: {
    async handleVerify() {
      console.log("handleVerify");
      const lineVerifyFriend = functions.httpsCallable("lineVerifyFriend");
      try {
        const { data } = await lineVerifyFriend({});
        console.log("handleVerify", data);
      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>
