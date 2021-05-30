<template>
  <div>
    <!-- Header -->
    <div class="mt-6 mx-6 lg:flex lg:items-center">
      <!-- Back and Preview -->
      <div class="flex space-x-4">
        <back-button url="/admin/restaurants/" />
      </div>

      <!-- Title -->
      <div class="mt-4 lg:mt-0 lg:flex-1 lg:flex lg:items-center lg:mx-4">
        <span class="text-base font-bold">
          {{ $t("admin.subAccounts.index") }}
        </span>
      </div>
    </div>

    <!-- Order Status -->
    <div class="mx-6 mt-6">
      <div v-for="(child, k) in children" :key="k">
        <nuxt-link :to="`/admin/subaccounts/accounts/${child.id}`">
          {{child.name}}/{{child.email}}/{{rList(child.restaurantLists)}}
          {{child.accepted === true ? "" : "not accepted now"}}
        </nuxt-link>
      </div>
    </div>

    <div class="mx-6 mt-6">
      {{ $t("admin.subAccounts.invite") }}
      <b-input
        v-model="name"
        :placeholder="$t('admin.subAccounts.enterName')"
        ></b-input>
      <b-input
        v-model="email"
        :placeholder="$t('admin.subAccounts.enterEmail')"
        ></b-input>
      <b-button @click="invite">
        {{$t("admin.subAccounts.send")}}
      </b-button>

    </div>
  </div>
</template>

<script>
import BackButton from "~/components/BackButton";
import { db, functions } from "~/plugins/firebase.js";

export default {
  components: {
    BackButton
  },
  async created() {
    const restaurantCollection = await db.collection("restaurants")
          .where("uid", "==", this.uid)
          .where("deletedFlag", "==", false)
          .orderBy("createdAt", "asc").get();
    this.restaurantObj = this.array2obj(restaurantCollection.docs.map(this.doc2data("restaurant")));

    const childDetacher  = await db.collection(`admins/${this.uid}/children`).onSnapshot((childrenCollection) => {
      this.children = childrenCollection.docs.map(this.doc2data("admin"));
    });
    this.detachers.push(childDetacher);

    /*
    const messageDetacher  = await db.collectionGroup(`messages`)
          .where("fromUid", "==", this.uid)
          .orderBy("createdAt", "desc")
          .onSnapshot((messageCollection) => {
      this.messages = messageCollection.docs.map(this.doc2data("message"));
    });
    this.detachers.push(messageDetacher);
    */
  },
  destroyed() {
    if (this.detachers.length > 0) {
      this.detachers.map(d => {
        d();
      });
    }
  },
  data() {
    return {
      detachers: [],
      children: [],
      messages: [],
      restaurantObj: {},
      email: "",
      name: "",
    }
  },
  methods: {
    rList(restaurantLists) {
      return (restaurantLists ||[]).map((r) => {
        return this.restaurantObj[r].restaurantName;
      }).slice(0,2).join(",");
    },
    async invite() {
      const inviteFunc = functions.httpsCallable("subAccountInvite");
      const res = await inviteFunc({email: this.email, name: this.name});
      this.email = "";
      this.name = "";
    },
  },
  computed: {
    isOwner() {
      return !this.$store.getters.isSubAccount;
    },
    uid() {
      return this.$store.getters.uidAdmin;
    },
  },
};
</script>
