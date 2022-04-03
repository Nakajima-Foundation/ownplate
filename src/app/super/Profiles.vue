<template>
  <section class="section">
    <back-button url="/s" />
    <h2>Profiles</h2>
    <b-input v-model="prefix" placeholder="email prefix"></b-input>
    <b-button @click="handleSearch">Search</b-button>
    <table>
      <tr v-for="profile in profiles" :key="profile.uid">
        <td>{{ profile.email }}</td>
        <td>
          <router-link :to="`/s/admins/${profile.uid}`">{{
            profile.uid
          }}</router-link>
        </td>
      </tr>
    </table>
  </section>
</template>

<script>
import BackButton from "~/components/BackButton";
import { db } from "~/plugins/firebase";

export default {
  metaInfo() {
    return {
      title: [this.defaultTitle, "Super All Profiles"].join(" / "),
    };
  },
  components: {
    BackButton,
  },
  data() {
    return {
      prefix: "",
      profiles: [],
    };
  },
  methods: {
    handleSearch() {
      this.detatcher = db
        .collectionGroup("private")
        .limit(100)
        .where("email", ">=", this.prefix)
        .where("email", "<=", this.prefix + "\uf8ff")
        .onSnapshot((snapshot) => {
          this.profiles = snapshot.docs.map((doc) => {
            const data = doc.data();
            data.uid = doc.ref.parent.parent.id;
            return data;
          });
          console.log(this.profiles);
        });
    },
  },
};
</script>
