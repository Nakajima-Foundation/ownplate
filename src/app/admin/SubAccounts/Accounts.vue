<template>
  <div>
    <!-- Header -->
    <div class="mx-6 mt-4 lg:flex lg:items-center">
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
    <div class="mx-6 mt-4">
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
                  (child.accepted === true ? "accepted" : "waiting"),
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

    <div class="mx-6 mt-2">
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
                sending
                  ? "admin.subAccounts.sending"
                  : "admin.subAccounts.send",
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
    <div class="mx-6 mt-2">
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
                      : "waiting"),
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

<script lang="ts">
import { defineComponent, ref, onUnmounted, watch } from "vue";

import { db } from "@/lib/firebase/firebase9";
import {
  collection,
  onSnapshot,
  getDocs,
  query,
  where,
  orderBy,
  collectionGroup,
  Unsubscribe,
  DocumentData,
} from "firebase/firestore";

import {
  subAccountDeleteChild,
  subAccountInvite,
} from "@/lib/firebase/functions";

import { doc2data, array2obj, useAdminUids, defaultTitle } from "@/utils/utils";

import BackButton from "@/components/BackButton.vue";
import { RestaurantInfoData } from "@/models/RestaurantInfo";

import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useHead } from "@unhead/vue";
import moment from "moment";

export default defineComponent({
  components: {
    BackButton,
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const restaurantObj = ref<{ [key: string]: RestaurantInfoData }>({});
    const children = ref<DocumentData[]>([]);
    const detachers: Unsubscribe[] = [];
    const messages = ref<DocumentData[]>([]);
    const errors = ref<string[]>([]);
    const email = ref("");
    const name = ref("");
    const sending = ref(false);

    const { uid } = useAdminUids();
    useHead({
      title: [defaultTitle, "Admin Subaccount Accounts"].join(" / "),
    });

    getDocs(
      query(
        collection(db, "restaurants"),
        where("uid", "==", uid.value),
        where("deletedFlag", "==", false),
        orderBy("createdAt", "asc"),
      ),
    ).then((restaurantCollection) => {
      restaurantObj.value = array2obj(
        restaurantCollection.docs.map(doc2data("restaurant")),
      ) as { [key: string]: RestaurantInfoData };
    });
    const childDetacher = onSnapshot(
      collection(db, `admins/${uid.value}/children`),
      (childrenCollection) => {
        children.value = childrenCollection.docs.map(doc2data("admin"));
      },
    );
    detachers.push(childDetacher);

    const messageDetacher = onSnapshot(
      query(
        collectionGroup(db, `messages`),
        where("fromUid", "==", uid.value),
        orderBy("createdAt", "desc"),
      ),
      (messageCollection) => {
        messages.value = messageCollection.docs.map(doc2data("message"));
      },
    );
    detachers.push(messageDetacher);

    onUnmounted(() => {
      if (detachers.length > 0) {
        detachers.forEach((d) => {
          d();
        });
      }
    });

    const deleteChild = (childId: string) => {
      store.commit("setAlert", {
        code: "admin.subAccounts.confirmDeletechild",
        callback: async () => {
          store.commit("setLoading", true);
          await subAccountDeleteChild({ childUid: childId });
          store.commit("setLoading", false);
        },
      });
    };
    const rList = (restaurantLists: string[]) => {
      return (restaurantLists || [])
        .map((r) => {
          return restaurantObj.value[r]?.restaurantName;
        })
        .filter((_name) => {
          return !!_name;
        })
        .slice(0, 2);
    };
    const invite = async () => {
      sending.value = true;
      try {
        const res = (await subAccountInvite({
          email: email.value,
          name: name.value,
        })) as any;
        if (res.data.result) {
          router.push("/admin/subAccounts/accounts/" + res.data.childUid);
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

      moment,
    };
  },
});
</script>
