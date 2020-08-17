<template>
  <section class="section">
    <back-button url="/s/admins" />
    <h1>Admin</h1>
    {{admin.name}}, {{adminPrivate.email}}
    <h1>Custome Claims</h1>
    <div>
      <b-checkbox v-model="isAdmin" disabled>Admin</b-checkbox>
      <b-checkbox v-model="isOperator">Operator</b-checkbox>
    </div>
    <h1>Restaurants</h1>
    <div v-for="restaurant in restaurants" :key="restaurant.id">
      <restaurant :restaurant="restaurant"></restaurant>
    </div>
  </section>
</template>

<script>
import BackButton from "~/components/BackButton";
import { db, functions } from "~/plugins/firebase.js";
import Restaurant from "~/app/super/Components/Restaurant";
export default {
  components: {
    BackButton,
    Restaurant
  },
  data() {
    return {
      customClaims: {},
      restaurants: [],
      admin: {},
      adminPrivate: {},
    };
  },
  computed: {
    isAdmin() {
      return !!this.customClaims.admin;
    },
    isOperator: {
      get() {
        return this.customClaims.operator;
      },
      async set(value) {
        this.$store.commit("setLoading", true);
        try {
          const { data } = await this.superDispatch({
            cmd: "setCustomClaim",
            uid: this.adminId,
            key: "operator",
            value: value
          });
          console.log(data);
          this.customClaims = data.result;
        } catch (error) {
          console.error(error);
        } finally {
          this.$store.commit("setLoading", false);
        }
      }
    },
    adminId() {
      return this.$route.params.adminId;
    },
    superDispatch() {
      return functions.httpsCallable("superDispatch");
    }
  },
  async mounted() {
    const { data } = await this.superDispatch({
      cmd: "getCustomeClaims",
      uid: this.adminId
    });
    this.customClaims = data.result;
    const snapshot = await db
      .collection("/restaurants/")
      .where("uid", "==", this.adminId)
      .get();
    this.restaurants = snapshot.docs.map(this.doc2data("admin"));
    console.log(this.restaurants);

    const adminPrivateSnapshot = await db
          .doc("/admins/" + this.adminId + "/private/profile").get();
    const adminSnapshot = await db
          .doc("/admins/" + this.adminId).get();
    if (adminPrivateSnapshot.exists) {
      this.adminPrivate = adminPrivateSnapshot.data();
    }
    if (adminSnapshot.exists) {
      this.admin = adminSnapshot.data();
    }
    console.log(this.admin, this.adminPrivate);
  }
};
</script>
