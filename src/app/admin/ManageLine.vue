<template>
  <section class="section">
    <div class="align-center">
      <b-button class="b-reset op-button-small" style="background:#18b900" tag="a" :href="lineAuth">
        <i class="fab fa-line c-text-white-full m-l-24 m-r-8" style="font-size:24px" />
        <span class="c-text-white-full m-r-24">
          {{
          $t("line.notifyMe")
          }}
        </span>
      </b-button>
    </div>
  </section>
</template>

<script>
import { db } from "~/plugins/firebase.js";
export default {
  async mounted() {
    const userId = this.$route.query.userId;
    const displayName = this.$route.query.displayName;
    console.log("***", userId, displayName);
    await db.doc(`restaurants/${this.restaurantId()}/lines/${userId}`).set(
      {
        displayName
      },
      { merge: true }
    );
  },
  computed: {
    lineAuth() {
      return this.lineAuthURL("/callback/line", location.pathname);
    }
  }
};
</script>
