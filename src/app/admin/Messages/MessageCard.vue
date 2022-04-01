<template>
  <div v-if="message.toDisplay">
    <div v-if="message.type==='childInvitation'">
      {{moment(message.createdAt.toDate()).format("YYYY/MM/DD HH:mm")}}<br/>
      {{$t('admin.messages.childInvitationMessage1')}}<br/>
      <router-link :to="'/o/' + message.fromUid">{{$t('admin.messages.childInvitationMessage2')}}</router-link><br/>
      {{$t('admin.messages.childInvitationMessage3')}}<br/>
      <b-button @click="childInvitationAccept">{{$t('admin.messages.accept')}}</b-button>
      <b-button @click="childInvitationDeny">{{$t('admin.messages.deny')}}</b-button>
    </div>
  </div>
</template>


<script>
import { db, functions } from "~/plugins/firebase.js";

export default {
  name: "MessageCard",
  props: {
    message: Object,
  },

  async created() {
    const uid = this.message.fromUid;
    console.log(this.message);
  },
  methods: {
    childInvitationAccept() {
      this.$store.commit("setAlert", {
        title: "admin.messages.childInvitationAccept",
        code: "admin.messages.childInvitationAcceptMessage",
        callback: async () => {
          this.$store.commit("setLoading", true);
          const inviteFunc = functions.httpsCallable("subAccountInvitationAccept");
          await inviteFunc({messageId: this.message.id});
          this.$store.commit("setLoading", false);
          this.$router.go({path: this.$router.currentRoute.path, force: true})
        }
      });
    },
    childInvitationDeny() {
      console.log("deny");
      this.$store.commit("setAlert", {
        code: "admin.messages.childInvitationDeny",
        callback: async () => {
          this.$store.commit("setLoading", true);
          const inviteFunc = functions.httpsCallable("subAccountInvitationDeny");
          await inviteFunc({messageId: this.message.id});
          this.$store.commit("setLoading", false);

        }
      });
    },
  }
}
</script>
