<template>
  <div class="m-l-24 m-r-24">
    <!-- Back Button -->
    <back-button :url="`/admin/restaurants/${restaurantId()}/orders`" class="m-t-24" />
    <div class="align-center">
      <b-button class="b-reset op-button-small" style="background:#18b900" @click="handleLineAuth">
        <i class="fab fa-line c-text-white-full m-l-24 m-r-8" style="font-size:24px" />
        <span class="c-text-white-full m-r-24">
          {{
          $t("admin.order.lineAdd")
          }}
        </span>
      </b-button>
    </div>
    <div class="m-t-24">
      <div v-for="lineUser in lineUsers" :key="lineUser.id" @click="handleToggle(lineUser)">
        <i :class="iconClass(lineUser)" />
        {{ lineUser.displayName }}
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "~/plugins/firebase.js";
import BackButton from "~/components/BackButton";
import { lineAuthURL, lineVerify } from "~/plugins/line.js";

export default {
  components: {
    BackButton
  },
  data() {
    return {
      lineUsers: [],
      detacher: null
    };
  },
  async created() {
    const lineId = this.$route.query.userId;
    const displayName = this.$route.query.displayName;
    const state = this.$route.query.state;
    if (lineId && displayName && state) {
      if (lineVerify(state)) {
        await db.doc(`restaurants/${this.restaurantId()}/lines/${lineId}`).set(
          {
            displayName,
            notify: true
          },
          { merge: true }
        );
        console.log("registered lineId", lineId);
      } else {
        console.error("invalid state", state);
      }
      this.$router.replace(location.pathname);
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
    },
    handleLineAuth() {
      const url = lineAuthURL("/callback/line", {
        pathname: location.pathname
      });
      location.href = url;
    }
  }
};
</script>
