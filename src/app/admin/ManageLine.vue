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
    <div class="m-t-8">
      <div v-for="lineUser in lineUsers" :key="lineUser.id" @click="handleToggle(lineUser)">
        <i :class="iconClass(lineUser)" />
        {{ lineUser.displayName }}
      </div>
    </div>
  </section>
</template>

<script>
import { db } from "~/plugins/firebase.js";
export default {
  data() {
    return {
      lineUsers: [],
      detacher: null
    };
  },
  async created() {
    const lineId = this.$route.query.userId;
    const displayName = this.$route.query.displayName;
    if (lineId && displayName) {
      try {
        await db.doc(`restaurants/${this.restaurantId()}/lines/${lineId}`).set(
          {
            displayName,
            notify: true
          },
          { merge: true }
        );
        console.log("registered lineId", lineId);
        this.$router.replace(location.pathname);
      } catch (error) {
        console.error(error.message);
        // BUGBUG: code
        this.$store.commit("setErrorMessage", {
          code: "line.validation",
          message2: error.message,
          error
        });
      }
    }
  },
  async mounted() {
    this.detacher = db
      .collection(`restaurants/${this.restaurantId()}/lines`)
      .onSnapshot(snapshot => {
        this.lineUsers = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id
          };
        });
      });
  },
  destroyed() {
    this.detacher && this.detacher();
  },
  methods: {
    async handleToggle(lineUser) {
      await db
        .doc(`restaurants/${this.restaurantId()}/lines/${lineUser.id}`)
        .update({
          notify: !lineUser.notify
        });
    },
    iconClass(lineUser) {
      return lineUser.notify ? "far fa-check-square" : "far fa-square";
    }
  },
  computed: {
    lineAuth() {
      return this.lineAuthURL("/callback/line", location.pathname);
    }
  }
};
</script>
