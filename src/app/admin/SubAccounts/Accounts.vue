<template>
  <div>
    <!-- Header -->
    <div class="mx-6 mt-6 lg:flex lg:items-center">
      <!-- Back and Preview -->
      <div class="flex space-x-4">
        <back-button url="/admin/restaurants/" />
      </div>

      <!-- Title -->
      <div class="mt-4 lg:mx-4 lg:mt-0 lg:flex lg:flex-1 lg:items-center">
        <span class="text-base text-xl font-bold">
          {{ $t("admin.subAccounts.index") }}
        </span>
      </div>
    </div>

    <!-- Sub Account list -->
    <div class="mx-6 mt-6">
      <div class="mt-2 text-base font-bold">
        {{ $t("admin.subAccounts.subaccountlist") }}
      </div>
      <table class="w-full rounded-lg bg-white shadow">
        <tr v-for="(child, k) in children" :key="k" class="items-center">
          <td class="p-2">
            <router-link :to="`/admin/subaccounts/accounts/${child.id}`">
              {{ child.name }}({{ child.email }})
            </router-link>
          </td>
          <td class="p-2">
            <div
              v-for="(rname, k2) in rList(child.restaurantLists)"
              :key="`${k}_${k2}`"
            >
              {{ rname }}
            </div>
          </td>
          <td class="p-2">
            {{ (child.restaurantLists || []).length
            }}{{ $t("admin.subAccounts.numberOfShops") }}
          </td>
          <td class="p-2">
            {{
              $t(
                "admin.subAccounts.messageResult." +
                  (child.accepted === true ? "accepted" : "waiting")
              )
            }}
          </td>
          <td class="p-2">
            <o-button @click="deleteChild(child.id)">
              {{ $t("admin.subAccounts.deleteSubaccount") }}
            </o-button>
          </td>
        </tr>
      </table>
    </div>

    <div class="mx-6 mt-6">
      <span class="text-base text-xl font-bold">
        {{ $t("admin.subAccounts.invite") }}
      </span>

      <div class="mt-2 rounded-lg bg-white p-4 shadow">
        <span class="text-base font-bold">
          {{ $t("admin.subAccounts.name") }}
        </span>
        <o-input
          v-model="name"
          :placeholder="$t('admin.subAccounts.enterName')"
        ></o-input>
        {{ $t("admin.subAccounts.email") }} :
        <o-input
          v-model="email"
          :placeholder="$t('admin.subAccounts.enterEmail')"
        ></o-input>
        <div class="text-xs font-bold text-red-700">
          * {{ $t("admin.subAccounts.accountNotice") }}
        </div>
        <div>
          <o-button @click="invite" :disabled="sending">
            {{
              $t(
                sending ? "admin.subAccounts.sending" : "admin.subAccounts.send"
              )
            }}
          </o-button>
        </div>
      </div>
      <div v-if="errors.length > 0">
        <div v-for="(error, k) in errors" :key="k">
          {{ $t(error) }}
        </div>
      </div>
    </div>
    <div class="mx-6 mt-6">
      <span class="text-base font-bold">
        {{ $t("admin.subAccounts.invitedList") }}
      </span>
      <div v-for="(message, k) in messages" :key="k">
        <div v-if="message.fromDisplay">
          <div v-if="message.type === 'childInvitation'">
            {{ message.email }}/{{
              $t(
                "admin.subAccounts.messageResult." +
                  (message.accepted === true
                    ? "accepted"
                    : message.accepted === false
                    ? "denied"
                    : "waiting")
              )
            }}/{{
              moment(message.createdAt.toDate()).format("YYYY/MM/DD HH:mm")
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onUnmounted, watch } from "vue";

import { db } from "@/plugins/firebase";
import {
  subAccountDeleteChild,
  subAccountInvite,
} from "@/lib/firebase/functions";

import { doc2data, array2obj, useAdminUids } from "@/utils/utils";

import BackButton from "@/components/BackButton.vue";

import { useStore } from "vuex";

export default defineComponent({
  metaInfo() {
    return {
      title: [this.defaultTitle, "Admin Subaccount Accounts"].join(" / "),
    };
  },
  components: {
    BackButton,
  },
  setup(props, ctx) {
    const store = useStore();

    const restaurantObj = ref({});
    const children = ref([]);
    const detachers = [];
    const messages = ref([]);
    const errors = ref([]);
    const email = ref("");
    const name = ref("");
    const sending = ref(false);

    const { isOwner, uid } = useAdminUids();

    db.collection("restaurants")
      .where("uid", "==", uid.value)
      .where("deletedFlag", "==", false)
      .orderBy("createdAt", "asc")
      .get()
      .then((restaurantCollection) => {
        restaurantObj.value = array2obj(
          restaurantCollection.docs.map(doc2data("restaurant"))
        );
      });
    const childDetacher = db
      .collection(`admins/${uid.value}/children`)
      .onSnapshot((childrenCollection) => {
        children.value = childrenCollection.docs.map(doc2data("admin"));
      });
    detachers.push(childDetacher);

    const messageDetacher = db
      .collectionGroup(`messages`)
      .where("fromUid", "==", uid.value)
      .orderBy("createdAt", "desc")
      .onSnapshot((messageCollection) => {
        messages.value = messageCollection.docs.map(doc2data("message"));
      });
    detachers.push(messageDetacher);

    onUnmounted(() => {
      if (detachers.length > 0) {
        detachers.map((d) => {
          d();
        });
      }
    });

    const deleteChild = (childId) => {
      store.commit("setAlert", {
        code: "admin.subAccounts.confirmDeletechild",
        callback: async () => {
          store.commit("setLoading", true);
          await subAccountDeleteChild({ childUid: childId });
          store.commit("setLoading", false);
        },
      });
    };
    const rList = (restaurantLists) => {
      return (restaurantLists || [])
        .map((r) => {
          return restaurantObj.value[r]?.restaurantName;
        })
        .filter((name) => {
          return !!name;
        })
        .slice(0, 2);
    };
    const invite = async () => {
      sending.value = true;
      try {
        const res = await subAccountInvite({
          email: email.value,
          name: name.value,
        });
        if (res.data.result) {
          ctx.root.$router.push(
            "/admin/subAccounts/accounts/" + res.data.childUid
          );
          email.value = "";
          name.value = "";
        } else {
          errors.value = ["admin.subAccounts.inviteInputError"];
        }
      } catch (e) {
        errors.value = ["admin.subAccounts.inviteInputError"];
      }
      sending.value = false;
    };

    watch(email, () => {
      errors.value = [];
    });
    watch(name, () => {
      errors.value = [];
    });

    return {
      restaurantObj,
      children,
      messages,
      errors,
      email,
      name,
      sending,

      deleteChild,
      rList,
      invite,
    };
  },
});
</script>
