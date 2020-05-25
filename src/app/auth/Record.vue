<template>
  <section class="section">
    <div v-if="success">
      <p>ご協力ありがとうございます</p>
    </div>
  </section>
</template>

<script>
import { ownPlateConfig } from "@/config/project";
import { db, firestore, functions } from "~/plugins/firebase.js";

export default {
  data() {
    return {
      success: false
    };
  },
  async mounted() {
    console.log("user =", this.user, this.isLineUser);
    if (this.isLineUser) {
      console.log("line user", this.user.uid);
      if (this.traceId) {
        try {
          const doc = await db.collection(`line/${this.user.uid}/records`).add({
            traceId: this.traceId,
            uid: this.user.uid,
            at: firestore.FieldValue.serverTimestamp(),
            processed: false
          });
          console.log("recorded as", doc.id);
          this.success = true;

          const traceProcess = functions.httpsCallable("traceProcess");
          const { data } = await traceProcess({ eventId: doc.id });
          console.log("traceProcess", data);
        } catch (error) {
          console.error(error);
        }
      }
    } else {
      location.href = this.lineAuth;
    }
  },
  computed: {
    event() {
      return this.$route.query.event;
    },
    traceId() {
      return this.$route.params.traceId;
    },
    lineAuth() {
      const query = {
        response_type: "code",
        client_id: ownPlateConfig.line.TRACK_CHANNEL_ID,
        redirect_uri: this.redirect_uri,
        scope: "profile openid",
        state: "s" + Math.random(), // LATER: Make it more secure
        nonce: `${this.traceId}` // HACK: Repurposing nonce
      };
      const queryString = Object.keys(query)
        .map(key => {
          return key + "=" + encodeURIComponent(query[key]);
        })
        .join("&");
      return `https://access.line.me/oauth2/v2.1/authorize?${queryString}`;
    },
    redirect_uri() {
      return location.origin + "/callback/track";
    },
    isLineUser() {
      return this.user && this.user.uid.slice(0, 5) === "line:";
    },
    user() {
      return this.$store.state.user;
    }
  }
};
</script>

