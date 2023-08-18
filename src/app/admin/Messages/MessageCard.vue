<template>
  <div v-if="message.toDisplay">
    <div v-if="message.type === 'childInvitation'">
      {{ moment(message.createdAt.toDate()).format("YYYY/MM/DD HH:mm") }}<br />
      {{ $t("admin.messages.childInvitationMessage1") }}<br />

      <router-link :to="'/o/' + message.fromUid">
        <div
          class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
          <span class="text-sm font-bold text-op-teal">{{
          $t("admin.messages.childInvitationMessage2")
          }}</span>
        </div>
      </router-link
      ><br />
      {{ $t("admin.messages.childInvitationMessage3") }}<br />
      <o-button @click="childInvitationAccept">{{
        $t("admin.messages.accept")
      }}</o-button>
      <o-button @click="childInvitationDeny">{{
        $t("admin.messages.deny")
      }}</o-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import {
  subAccountInvitationAccept,
  subAccountInvitationDeny,
} from "@/lib/firebase/functions";

import { useStore } from "vuex";
import {
  useRouter,
  useRoute,
} from "vue-router";

import moment from "moment-timezone";

export default defineComponent({
  name: "MessageCard",
  props: {
    message: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    const childInvitationAccept = () => {
      store.commit("setAlert", {
        title: "admin.messages.childInvitationAccept",
        code: "admin.messages.childInvitationAcceptMessage",
        callback: async () => {
          store.commit("setLoading", true);
          await subAccountInvitationAccept({ messageId: props.message.id });
          store.commit("setLoading", false);
          // @ts-ignore
          router.go({
            path: route.path,
            force: true,
          });
        },
      });
    };
    const childInvitationDeny = () => {
      console.log("deny");
      store.commit("setAlert", {
        code: "admin.messages.childInvitationDeny",
        callback: async () => {
          store.commit("setLoading", true);
          await subAccountInvitationDeny({ messageId: props.message.id });
          store.commit("setLoading", false);
        },
      });
    };
    return {
      childInvitationAccept,
      childInvitationDeny,
      moment,
    };
  },
});
</script>
