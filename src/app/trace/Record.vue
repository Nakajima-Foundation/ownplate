<template>
  <section class="section">
    <div v-if="traceId">
      <div v-if="success">
        <h1>{{$t('trace.thankyou')}}</h1>
      </div>
    </div>
    <div v-else>
      <div v-if="user">
        <h1>{{$t('trace.thankyou')}}</h1>
        <div class="m-t-16">
          <div v-for="record in records" :key="record.id">
            <span>{{record.timeCreated.toLocaleString()}}</span>
            <span>{{$t('trace.' + record.event)}}</span>
            <span>{{record.processed ? "*" : " "}}</span>
            <span>{{record.restaurantName}}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ownPlateConfig } from "@/config/project";
import { db, firestore, functions } from "~/plugins/firebase.js";
import * as crypto from "crypto";
import { lineAuthURL } from "~/plugins/line.js";

export default {
  data() {
    return {
      success: false,
      records: [],
      detatcher: null
    };
  },
  methods: {
    async record(lineUid) {
      const hash = crypto
        .createHash("sha256")
        .update(lineUid)
        .digest("hex");
      //console.log("*********", hash);

      const refRecords = db.collection(`hash/${hash}/records`);
      if (this.traceId) {
        try {
          const doc = await refRecords.add({
            traceId: this.traceId,
            uid: hash,
            timeCreated: firestore.FieldValue.serverTimestamp(),
            processed: false
          });
          //console.log("recorded as", doc.id);
          this.success = true;

          const traceProcess = functions.httpsCallable("traceProcess");
          const { data } = await traceProcess({ eventId: doc.id });
          console.log("traceProcess", data);
          this.$router.replace("/t");
        } catch (error) {
          console.error(error);
        }
      } else {
        this.detatcher = refRecords
          .orderBy("timeCreated", "desc")
          .limit(25)
          .onSnapshot(snapshot => {
            this.records = snapshot.docs.map(doc => {
              const record = doc.data();
              record.timeCreated = record.timeCreated.toDate();
              return record;
            });
            //console.log("snapshot", this.records);
          });
      }
    }
  },
  mounted() {
    if (this.user) {
      const claims = this.$store.state.claims;
      if (claims.line) {
        //console.log("***** DEBUG *****", claims.line);
        this.record(claims.line);
        return;
      }
    }
    if (this.traceId) {
      const url = lineAuthURL(
        "/callback/track",
        {
          traceId: this.traceId
        },
        ownPlateConfig.line.TRACK_CHANNEL_ID
      );
      location.href = url;
    }
  },
  destroyed() {
    this.detatcher && this.detatcher();
  },
  computed: {
    event() {
      return this.$route.query.event;
    },
    traceId() {
      return this.$route.params.traceId;
    }
  }
};
</script>

