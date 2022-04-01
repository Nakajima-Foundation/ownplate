<template>
  <div>
    <!-- Header -->
    <div class="mt-6 mx-6 lg:flex lg:items-center">
      <!-- Back and Preview -->
      <div class="flex space-x-4">
        <back-button url="/admin/subaccounts/" />
      </div>
    </div>

    <!-- Order Status -->
    <div class="mx-6 mt-6">
      <div class="mt-2">
        <span class="text-base font-bold">
          {{ $t("admin.subAccounts.name") }}
        </span>
        <b-input
          v-model="name"
          :placeholder="$t('admin.subAccounts.enterName')"
        ></b-input>

        <span class="text-base font-bold">
          {{ $t("admin.subAccounts.email") }} </span
        ><br />
        {{ child.email }} /
        {{
          $t(
            "admin.subAccounts.messageResult." +
              (child.accepted === true ? "accepted" : "waiting")
          )
        }}<br />
      </div>
      <div class="bg-white shadow rounded-lg p-4 mt-2">
        <span class="font-bold">{{
          $t("admin.subAccounts.selectRestaurant")
        }}</span>
        <div v-for="(restaurant, k) in restaurants" :key="k">
          <b-checkbox v-model="restaurantListObj[restaurant.id]">{{
            restaurant.restaurantName
          }}</b-checkbox>
        </div>
      </div>
      <div class="mt-2">
        <b-button @click="saveList">
          {{ $t("editCommon.save") }}
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
import BackButton from "~/components/BackButton";
import { db } from "~/plugins/firebase.js";

export default {
  components: {
    BackButton,
  },
  metaInfo() {
    return {
      title: [this.defaultTitle, "Admin Subaccount Account"].join(" / "),
    };
  },
  async created() {
    const restaurantCollection = await db
      .collection("restaurants")
      .where("uid", "==", this.uid)
      .where("deletedFlag", "==", false)
      .orderBy("createdAt", "asc")
      .get();
    this.restaurantObj = this.array2obj(
      restaurantCollection.docs.map(this.doc2data("restaurant"))
    );
    this.restaurants = restaurantCollection.docs
      .map(this.doc2data("restaurant"))
      .filter((r) => r.publicFlag);

    const childrenDoc = await db
      .doc(`admins/${this.uid}/children/${this.subAccountId}`)
      .get();
    this.child = childrenDoc.data();
    this.restaurantListObj = (this.child.restaurantLists || []).reduce(
      (t, c) => {
        t[c] = true;
        return t;
      },
      {}
    );
    this.name = this.child.name;
  },
  data() {
    return {
      restaurantObj: {},
      restaurants: [],
      child: {},
      restaurantListObj: {},
      name: "",
    };
  },
  methods: {
    async saveList() {
      await db.doc(`admins/${this.uid}/children/${this.subAccountId}`).update({
        restaurantLists: this.newRestaurantList,
        name: this.name,
      });
      this.$router.push("/admin/subaccounts/");
    },
  },
  computed: {
    isOwner() {
      return !this.$store.getters.isSubAccount;
    },
    uid() {
      return this.$store.getters.uidAdmin;
    },
    subAccountId() {
      return this.$route.params.subAccountId;
    },
    newRestaurantList() {
      return Object.keys(this.restaurantListObj).reduce((tmp, k) => {
        const c = this.restaurantListObj[k];
        if (c) {
          tmp.push(k);
        }
        return tmp;
      }, []);
    },
  },
};
</script>
