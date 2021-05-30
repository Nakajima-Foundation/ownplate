<template>
  <div v-if="message.toDisplay">
<div v-if="message.type==='childInvitation'">
  {{$t('admin.messages.childInvitationMessage1')}}<br/>
  <nuxt-link :to="'/o/' + message.fromUid">{{$t('admin.messages.childInvitationMessage2')}}</nuxt-link><br/>
  {{$t('admin.messages.childInvitationMessage3')}}<br/>
  {{moment(message.createdAt.toDate()).format("YYYY/MM/DD HH:mm")}}<br/>
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
        code: "admin.messages.childInvitationAccept",
        callback: async () => {
          this.$store.commit("setLoading", true);
          console.log(this.message.id);
          // const inviteFunc = functions.httpsCallable("subAccountAccept");
          // await inviteFunc({message: this.message.id});
          this.$store.commit("setLoading", false);

        }
      });
      console.log("accept");
    },
    childInvitationDeny() {
      console.log("deny");
      this.$store.commit("setAlert", {
        code: "admin.messages.childInvitationDeny",
        callback: async () => {
          this.$store.commit("setLoading", true);
          console.log(this.message.id);
          // const inviteFunc = functions.httpsCallable("subAccountDeny");
          // await inviteFunc({message: this.message.id});
          this.$store.commit("setLoading", false);

        }
      });
    },
  }
}
</script>
