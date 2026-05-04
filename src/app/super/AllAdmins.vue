<template>
  <section class="mx-auto max-w-full px-6 pt-4 pb-12">
    <back-button url="/s" />
    <h2>All Admins</h2>
    <table>
      <tr>
        <th>Name</th>
        <th>e-mail</th>
        <th>Created</th>
        <th>Admin</th>
        <th>Ope</th>
        <th>Stripe</th>
        <th>JCB</th>
      </tr>

      <tr v-for="admin in admins" :key="admin.id">
        <td style="padding-right: 8px">
          <router-link :to="`/s/admins/${admin.id}`">{{
            admin.name || "(no name)"
          }}</router-link>
        </td>
        <td style="padding-right: 8px">{{ profile(admin).email }}</td>
        <td style="padding-right: 8px">
          {{ moment(admin.created.toDate()).format("YYYY/MM/DD HH:mm") }}
        </td>
        <td style="padding-right: 8px">{{ admin.admin ? "A" : "" }}</td>
        <td style="padding-right: 8px">{{ admin.operator ? "O" : "" }}</td>
        <td
          v-if="payment(admin).verified === false"
          style="color: red; padding-right: 8px"
        >
          {{ payment(admin).stripe }}
        </td>
        <td style="padding-right: 8px" v-else>{{ payment(admin).stripe }}</td>
        <td style="padding-right: 8px">
          {{ capabilities(admin).jcb_payments }}
          <button
            v-if="showActivate(admin)"
            @click="activate(admin)"
            class="cursor-pointe cursor-pointer rounded border-2 border-black/40 bg-gray-200 p-1 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-25"
          >
            Activate
          </button>
        </td>
      </tr>
    </table>
    <div>
      <button @click="updateQuery">
        <span v-if="last">Next</span>
        <span v-else>Top</span>
      </button>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import { db } from "@/lib/firebase/firebase9";
import {
  onSnapshot,
  updateDoc,
  doc,
  collection,
  query,
  orderBy,
  startAfter,
  limit,
  getDoc,
  DocumentData,
  QueryDocumentSnapshot,
  Unsubscribe,
} from "firebase/firestore";

import { stripeVerify } from "@/lib/firebase/functions";

import BackButton from "@/components/BackButton.vue";

import { useSuper, doc2data, defaultTitle, errorMessage } from "@/utils/utils";
import { useHead } from "@unhead/vue";
import moment from "moment";

const QUERY_LIMIT = 50;

export default defineComponent({
  components: {
    BackButton,
  },
  setup() {
    useSuper();

    type AdminData = DocumentData & { id: string };
    type AdminInfo = {
      payment?: DocumentData;
      profile?: DocumentData;
      account?: { capabilities?: { [key: string]: string } };
    };
    const admins = ref<AdminData[]>([]);
    const infos = ref<{ [key: string]: AdminInfo }>({});
    const last = ref<QueryDocumentSnapshot | null>(null);
    let detacher: Unsubscribe | null = null;

    useHead(() => ({
      title: [defaultTitle, "Super All Admin"].join(" / "),
    }));

    const updateInfo = async (admin: AdminData) => {
      const info: AdminInfo = {};
      const payment = (
        await getDoc(doc(db, `admins/${admin.id}/public/payment`))
      ).data();
      if (payment?.stripe) {
        try {
          const { data } = await stripeVerify({
            account_id: payment?.stripe,
          });
          const verifyData = data as {
            result?: boolean;
            account?: { capabilities?: { [key: string]: string } };
          };
          payment.verified = verifyData.result;
          if (verifyData.account) {
            info.account = verifyData.account;
          }
        } catch (error) {
          console.error(errorMessage(error));
          payment.verified = false;
        }
      }
      info.payment = payment || {};
      const profile = (
        await getDoc(doc(db, `admins/${admin.id}/private/profile`))
      ).data();
      info.profile = profile || {};
      infos.value[admin.id] = info;
      infos.value = { ...infos.value };
    };
    const updateQuery = () => {
      detacher?.();
      let myQuery = query(
        collection(db, "admins"),
        limit(QUERY_LIMIT),
        orderBy("created", "desc"),
      );
      if (last.value) myQuery = query(myQuery, startAfter(last.value));
      detacher = onSnapshot(myQuery, (snapshot) => {
        if (snapshot.docs.length === QUERY_LIMIT) {
          last.value = snapshot.docs[QUERY_LIMIT - 1];
        } else {
          last.value = null;
        }
        const _admins = snapshot.docs.map(doc2data("admin"));
        _admins.forEach((admin) => {
          admins.value.push(admin);
          // NOTE: We are getting extra data only once for each admin
          if (!infos.value[admin.id]) {
            updateInfo(admin);
          }
        });
      });
    };
    const profile = (admin: AdminData) => {
      return infos.value[admin.id]?.profile || {};
    };
    const payment = (admin: AdminData) => {
      return infos.value[admin.id]?.payment || {};
    };
    const account = (admin: AdminData) => {
      return infos.value[admin.id]?.account || {};
    };
    const capabilities = (admin: AdminData) => {
      return account(admin)?.capabilities || {};
    };
    const showActivate = (admin: AdminData) => {
      return (
        capabilities(admin).jcb_payments === "active" &&
        !payment(admin).stripeJCB
      );
    };
    const activate = async (admin: AdminData) => {
      await updateDoc(doc(db, `admins/${admin.id}/public/payment`), {
        stripeJCB: true,
      });
      updateInfo(admin);
    };
    updateQuery();
    return {
      admins,
      last,
      updateQuery,

      profile,
      payment,
      capabilities,
      showActivate,
      activate,

      moment,
    };
  },
});
</script>
