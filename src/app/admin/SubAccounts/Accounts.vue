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
        <span class="text-base font-bold  text-xl">
          {{ $t("admin.subAccounts.index") }}
        </span>
      </div>
    </div>

    <!-- Order Status -->

    <div class="mx-6 mt-6">
      <div class="mt-2 text-base font-bold">
        {{ $t("admin.subAccounts.subaccountlist") }}
      </div>
      <div v-for="(child, k) in children" :key="k" class="flex items-center">
        <router-link :to="`/admin/subaccounts/accounts/${child.id}`">
          {{child.name}}/{{child.email}}/{{rList(child.restaurantLists)}}
          {{$t("admin.subAccounts.messageResult." + (child.accepted === true ? "accepted" : "waiting"))}}
        </router-link>
        <b-button @click="deleteChild(child.id)">
           {{ $t("admin.subAccounts.deleteSubaccount")}}
        </b-button>
      </div>
    </div>

    <div class="mx-6 mt-6">
      <span class="text-base font-bold text-xl">
        {{ $t("admin.subAccounts.invite") }}
      </span>

      <div class="bg-white shadow rounded-lg p-4 mt-2" >
        <span class="text-base font-bold">
          {{ $t("admin.subAccounts.name") }}
        </span>
        <b-input
          v-model="name"
          :placeholder="$t('admin.subAccounts.enterName')"
          ></b-input>
        {{ $t("admin.subAccounts.email") }} : <b-input
                                                v-model="email"
                                                :placeholder="$t('admin.subAccounts.enterEmail')"
                                                ></b-input>
        <div class="text-xs font-bold text-red-700">
          * 招待されるサブアカウントは、事前にユーザ登録をする必要があります
        </div>
        <div>
          <b-button @click="invite" :disabled="sending">
            {{$t(sending ? "admin.subAccounts.sending" : "admin.subAccounts.send")}}
          </b-button>
        </div>
      </div>
      <div v-if="errors.length > 0">
        <div v-for="(error, k) in errors" :key="k">
          {{$t(error)}}
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
            {{message.email}}/{{$t("admin.subAccounts.messageResult." +  (message.accepted === true ? "accepted" : (message.accepted === false ? "denied" : "waiting")))}}/{{moment(message.createdAt.toDate()).format("YYYY/MM/DD HH:mm")}}
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import BackButton from "~/components/BackButton";
import { db, functions } from "~/plugins/firebase.js";

export default {
  metaInfo() {
    return {
      title: [this.defaultTitle, "Admin Subaccount Accounts"].join(" / ")
    }
  },
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

    const messageDetacher  = await db.collectionGroup(`messages`)
          .where("fromUid", "==", this.uid)
          .orderBy("createdAt", "desc")
          .onSnapshot((messageCollection) => {
      this.messages = messageCollection.docs.map(this.doc2data("message"));
          });
    this.detachers.push(messageDetacher);

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
      errors: [],
      restaurantObj: {},
      email: "",
      name: "",
      sending: false,
    }
  },
  methods: {
    deleteChild(childId) {
      this.$store.commit("setAlert", {
        code: "admin.subAccounts.confirmDeletechild",
        callback: async () => {
          this.$store.commit("setLoading", true);
          const subAccountDeleteChildFunc = functions.httpsCallable("subAccountDeleteChild");
          await subAccountDeleteChildFunc({childUid: childId});
          this.$store.commit("setLoading", false);
        }
      });
    },
    rList(restaurantLists) {
      return (restaurantLists ||[]).map((r) => {
        return this.restaurantObj[r]?.restaurantName;
      }).filter((name) => {
        return !!name;
      }).slice(0,2).join(",");
    },
    async invite() {
      this.sending = true;
      try {
        const inviteFunc = functions.httpsCallable("subAccountInvite");
        const res = await inviteFunc({email: this.email, name: this.name});
        if (res.data.result) {
          this.$router.push("/admin/subAccounts/accounts/" + res.data.childUid);
          this.email = "";
          this.name = "";
        } else {
          this.errors = ["admin.subAccounts.inviteInputError"];
        }
      } catch (e) {
        this.errors = ["admin.subAccounts.inviteInputError"];
      }
      this.sending = false;
    },
  },
  watch: {
    email() {
      this.errors = [];
    },
    name() {
      this.errors = [];
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
