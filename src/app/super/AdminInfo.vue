<template>
  <section class="mx-auto max-w-full px-6 pt-4 pb-12">
    <back-button url="/s/admins" />
    <h1>Admin</h1>
    <div>
      <Checkbox v-model="admin.opt_out" @update:modelValue="updateOpt"
        >Opt out</Checkbox
      >
    </div>
    {{ admin.name }}, {{ adminPrivate.email }}
    <h1>Custome Claims</h1>
    <div>
      <Checkbox v-model="isAdmin" disabled>Admin</Checkbox>
      <Checkbox v-model="isOperator">Operator</Checkbox>
    </div>
    <h1>Restaurants</h1>
    <div v-for="restaurant in restaurants" :key="restaurant.id">
      <restaurant :restaurant="restaurant"></restaurant>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";

import { db } from "@/lib/firebase/firebase9";
import {
  getDoc,
  updateDoc,
  doc,
  collection,
  where,
  query,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import { superDispatch } from "@/lib/firebase/functions";

import BackButton from "@/components/BackButton.vue";
import Checkbox from "@/components/form/checkbox.vue";
import Restaurant from "@/app/super/Components/Restaurant.vue";

import { useSuper, doc2data, defaultTitle } from "@/utils/utils";
import { useRoute } from "vue-router";
import { useGeneralStore } from "@/store";
import { useHead } from "@unhead/vue";

export default defineComponent({
  components: {
    BackButton,
    Restaurant,
    Checkbox,
  },
  setup() {
    useSuper();
    const route = useRoute();
    const generalStore = useGeneralStore();

    // `setCustomClaim` は条件を満たさないと `{ result: false }` を返す。権限の読みは
    // 欄の有無で見るので、オブジェクトでないものを空として扱えば同じ結果になる。
    const claimsOf = (result: unknown): DocumentData =>
      typeof result === "object" && result !== null ? result : {};

    const customClaims = ref<DocumentData>({});
    const restaurants = ref<DocumentData[]>([]);
    const admin = ref<DocumentData>({});
    const adminPrivate = ref<DocumentData>({});

    // route の引数は型の上では配列にもなりうる。この経路は繰り返し指定ではないので
    // 常に文字列だが、文字列として扱うことを宣言でも言う。
    const adminId = String(route.params.adminId);

    useHead(() => ({
      title: [defaultTitle, "Super Admin info"].join(" / "),
    }));

    superDispatch({
      cmd: "getCustomeClaims",
      uid: adminId,
      key: "",
      value: false,
    }).then(({ data }) => {
      customClaims.value = claimsOf(data.result);
    });
    getDocs(
      query(collection(db, "/restaurants/"), where("uid", "==", adminId)),
    ).then((snapshot) => {
      restaurants.value = snapshot.docs.map(doc2data("admin"));
    });
    getDoc(doc(db, "/admins/" + adminId + "/private/profile")).then(
      (adminPrivateSnapshot) => {
        if (adminPrivateSnapshot.exists()) {
          adminPrivate.value = adminPrivateSnapshot.data();
        }
      },
    );
    getDoc(doc(db, "/admins/" + adminId)).then((adminSnapshot) => {
      if (adminSnapshot.exists()) {
        admin.value = adminSnapshot.data();
      }
    });

    const isAdmin = computed(() => {
      return !!customClaims.value.admin;
    });
    const isOperator = computed({
      get: () => {
        return customClaims.value.operator;
      },
      set: async (value) => {
        generalStore.setLoading(true);
        try {
          const { data } = await superDispatch({
            cmd: "setCustomClaim",
            uid: adminId,
            key: "operator",
            value,
          });
          customClaims.value = claimsOf(data.result);
        } catch (error) {
          console.error(error);
        } finally {
          generalStore.setLoading(false);
        }
      },
    });

    const updateOpt = () => {
      updateDoc(doc(db, "/admins/" + adminId), {
        opt_out: admin.value.opt_out,
      });
    };

    return {
      customClaims,
      restaurants,
      admin,
      adminPrivate,

      isAdmin,
      isOperator,
      adminId,

      updateOpt,
    };
  },
});
</script>
