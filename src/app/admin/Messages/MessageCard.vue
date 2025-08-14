<template>
  <div v-if="message.toDisplay">
    <div v-if="message.type === 'childInvitation'">
      {{ moment(message.createdAt.toDate()).format("YYYY/MM/DD HH:mm") }}<br />
      {{ $t("admin.messages.childInvitationMessage1") }}<br />

      <router-link :to="'/o/' + message.fromUid">
        <div
          class="inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
        >
          <span class="text-op-teal text-sm font-bold">{{
            $t("admin.messages.childInvitationMessage2")
          }}</span>
        </div> </router-link
      ><br />
      {{ $t("admin.messages.childInvitationMessage3") }}<br />
      <button
        @click="childInvitationAccept"
        class="text-op-teal inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4 text-sm font-bold"
      >
        {{ $t("admin.messages.accept") }}
      </button>
      <button
        @click="childInvitationDeny"
        class="text-op-teal inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4 text-sm font-bold"
      >
        {{ $t("admin.messages.deny") }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import {
  subAccountInvitationAccept,
  subAccountInvitationDeny,
} from "@/lib/firebase/functions";

import { useGeneralStore } from "@/store";
import { useDialogStore } from "@/store/dialog";
import { useRouter, useRoute } from "vue-router";

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
    const generalStore = useGeneralStore();
    const dialogStore = useDialogStore();
    const router = useRouter();
    const route = useRoute();

    const childInvitationAccept = () => {
      dialogStore.setAlert({
        title: "admin.messages.childInvitationAccept",
        code: "admin.messages.childInvitationAcceptMessage",
        callback: async () => {
          generalStore.setLoading(true);
          await subAccountInvitationAccept({ messageId: props.message.id });
          generalStore.setLoading(false);
          router.go({
            path: route.path,
            force: true,
          });
        },
      });
    };
    const childInvitationDeny = () => {
      console.log("deny");
      dialogStore.setAlert({
        code: "admin.messages.childInvitationDeny",
        callback: async () => {
          generalStore.setLoading(true);
          await subAccountInvitationDeny({ messageId: props.message.id });
          generalStore.setLoading(false);
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
