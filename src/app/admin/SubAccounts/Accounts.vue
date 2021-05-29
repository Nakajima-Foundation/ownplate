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
          {{ $t("SubAccounts.Index") }}
        </span>
      </div>
    </div>

    <!-- Order Status -->
    <div class="mx-6 mt-6">
      <div v-for="(child, k) in children" :key="k">
        <nuxt-link :to="`/admin/subaccounts/accounts/${child.id}`">
          {{child.name}}/{{child.email}}/{{rList(child.restaurantLists)}}
        </nuxt-link>
      </div>
    </div>

    <div class="mx-6 mt-6">
      {{ $t("SubAccounts.Invite") }}
      <b-input
        v-model="email"
        :placeholder="$t('SubAccounts.enterEmail')"
        ></b-input>
      <b-button @click="invite">
        {{$t("editCommon.save")}}
      </b-button>

    </div>
  </div>
</template>

<script>
import BackButton from "~/components/BackButton";
import { db } from "~/plugins/firebase.js";

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

    const childrenCollection = await db.collection(`admins/${this.uid}/children`).get()
    this.children = childrenCollection.docs.map(this.doc2data("admin"));

  },
  data() {
    return {
      children: [],
      restaurantObj: {},
      email: "",
    }
  },
  methods: {
    rList(restaurantLists) {
      return restaurantLists.map((r) => {
        return this.restaurantObj[r].restaurantName;
      }).slice(0,2).join(",");
    },
    invite() {
      console.log("TODO");
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
