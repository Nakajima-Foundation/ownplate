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
      </div>
    </div>
  </section>
</template>

<script>
import { parsePhoneNumber, formatNational } from "~/plugins/phoneutil.js";

export default {
  computed: {
    user() {
      return this.$store.state.user;
    },
    lineConnection() {
      return this.user?.claims?.line
        ? this.$t("profile.status.hasLine")
        : this.$t("profile.status.noLine");
    },
    lineFriend() {
      return this.user?.claims?.line
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
  }
};
</script>
