<template>
  <section class="section">
    <h1>{{"profile.title"}}</h1>
    <b-field class="m-t-8" :label="'profile.loginStatus'">
      <p>{{loginStatus}}</p>
    </b-field>
    <div v-if="user">
      <b-field class="m-t-8" :label="'profile.displayName'">
        <p>{{displayName}}</p>
      </b-field>
      <div v-if="user.phoneNumber">
        <b-field class="m-t-8" :label="'profile.lineConnection'">
          <p>{{lineConnection}}</p>
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
      return this.user?.claims.line
        ? "profile.status.hasLine"
        : "profile.status.noLine";
    },
    displayName() {
      return this.user?.displayName || "profile.undefined";
    },
    loginStatus() {
      if (this.user) {
        console.log(this.user);
        if (this.user.email) {
          const extra = this.user?.claims.admin ? "*admin" : "";
          return `${"profile.status.email"}: ${this.user.email} ${extra}`;
        } else if (this.user.phoneNumber) {
          const number = parsePhoneNumber(this.user.phoneNumber);
          return `${"profile.status.phone"}: ${formatNational(number)}`;
        } else if (this.user.uid.slice(0, 5) === "line:") {
          return "profile.status.line";
        }
        return "profile.status.unexpected";
      }
      return "profile.status.none";
    }
  }
};
</script>
