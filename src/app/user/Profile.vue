<template>
  <div class="mx-6 mt-6 lg:max-w-2xl lg:mx-auto">
    <!-- Title -->
    <div class="text-xl font-bold text-black text-opacity-30">
      {{ $t("profile.title") }}
    </div>

    <!-- Card -->
    <div class="bg-white rounded-lg shadow mt-2 p-6">
      <!-- Login Status -->
      <div class="text-center">
        <div class="text-sm font-bold text-black text-opacity-30">
          {{ $t("profile.loginStatus") }}
        </div>

        <div class="text-base font-bold mt-2">
          {{ loginStatus }}
        </div>
      </div>

      <!-- Not Signed In -->
      <div v-if="!user">
        <!-- Sign In as a User -->
        <div class="mt-6 text-center">
          <a
            class="inline-flex justify-center items-center h-16 px-6 rounded-full border-2 border-op-teal"
            @click.prevent="handleSignIn"
          >
            <i class="material-icons text-2xl text-op-teal mr-2">local_mall</i>
            <div class="text-lg font-bold text-op-teal">
              {{ $t("profile.signIn") }}
            </div>
          </a>
        </div>

        <!-- Sign In as a Restaurant -->
        <div class="mt-6 text-center">
          <router-link to="/admin/user/signin">
            <div
              class="inline-flex justify-center items-center h-16 px-6 rounded-full border-2 border-op-teal"
            >
              <i class="material-icons text-2xl text-op-teal mr-2">store</i>
              <div class="text-lg font-bold text-op-teal">
                {{ $t("profile.signInRestaurant") }}
              </div>
            </div>
          </router-link>
        </div>

        <!-- Phone Login-->
        <b-modal :active.sync="loginVisible" :width="488" scroll="keep">
          <div class="mx-2 my-6 p-6 bg-white shadow-lg rounded-lg">
            <phone-login v-on:dismissed="handleDismissed" />
          </div>
        </b-modal>
      </div>

      <!-- Signed In -->
      <div v-if="user && claims">
        <!-- For Takeout User -->
        <div v-if="user.phoneNumber">
          <!-- Order History -->
          <history-button />

          <!-- Favorites -->
          <favorite-button />

          <!-- Credit Card Info -->
          <div class="mt-6 text-center">
            <div class="text-sm font-bold text-black text-opacity-30">
              {{ $t("profile.stripeInfo") }}
            </div>

            <div class="text-base font-bold mt-2">
              {{ cardDescription }}
            </div>

            <div v-if="storedCard" class="mt-2">
              <b-button @click="handleDeleteCard" class="b-reset-tw">
                <div class="inline-flex justify-center items-center">
                  <i class="material-icons text-lg text-red-700 mr-2">delete</i>
                  <div class="text-sm font-bold text-red-700">
                    {{ $t("profile.deleteCard") }}
                  </div>
                </div>
              </b-button>
            </div>
          </div>

          <!-- LINE -->
          <div class="mt-6 p-4 rounded-lg bg-black bg-opacity-5">
            <!-- LINE Status -->
            <div class="text-center">
              <div class="text-sm font-bold text-black text-opacity-30">
                {{ $t("profile.lineConnection") }}
              </div>

              <div class="text-base font-bold mt-2">
                {{ lineConnection }}
              </div>
            </div>

            <!-- LINE Connected -->
            <div v-if="isLineUser">
              <!-- Friend Status -->
              <div class="mt-4 text-center">
                <div class="text-sm font-bold text-black text-opacity-30">
                  {{ $t("profile.lineFriend") }}
                </div>

                <div class="text-base font-bold mt-2">
                  {{ lineFriend }}
                </div>
              </div>

              <!-- Not Friend -->
              <div v-if="isFriend === false" class="mt-4 text-center">
                <b-button tag="a" :href="friendLink" class="b-reset-tw">
                  <div
                    class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
                    style="background:#18b900"
                  >
                    <i class="fab fa-line text-white text-2xl mr-2" />
                    <div class="text-sm font-bold text-white">
                      {{ $t("profile.friendLink") }}
                    </div>
                  </div>
                </b-button>
              </div>
            </div>

            <!-- LINE Not Connected -->
            <div v-else>
              <div v-if="isLineEnabled" class="mt-4 text-center">
                <b-button @click="handleLineAuth" class="b-reset-tw">
                  <div
                    class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
                    style="background:#18b900"
                  >
                    <i class="fab fa-line text-white text-2xl mr-2" />
                    <div class="text-sm font-bold text-white">
                      {{ $t("line.notifyMe") }}
                    </div>
                  </div>
                </b-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sign Out -->
        <div class="mt-12 text-center">
          <a
            @click.prevent="handleSignOut"
            class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
          >
            <div class="text-sm font-bold text-op-teal">
              {{ $t("menu.signOut") }}
            </div>
          </a>
        </div>

        <!-- Delete Account and Phone Login -->
        <div v-if="user.phoneNumber">
          <!-- Delete Account -->
          <div class="mt-4 text-center">
            <b-button @click="handleDeleteAccount" class="b-reset-tw">
              <div class="inline-flex justify-center items-center">
                <i class="material-icons text-lg text-red-700 mr-2">delete</i>
                <div class="text-sm font-bold text-red-700">
                  {{ $t("profile.deleteAccount") }}
                </div>
              </div>
            </b-button>
          </div>

          <!-- Phone Login-->
          <b-modal :active.sync="reLoginVisible" :width="488" scroll="keep">
            <div class="mx-2 my-6 p-6 bg-white shadow-lg rounded-lg">
              <phone-login
                v-on:dismissed="continueDelete"
                :relogin="user.phoneNumber"
              />
            </div>
          </b-modal>
        </div>
      </div>

      <!-- Loading -->
      <b-loading
        :is-full-page="false"
        :active="isDeletingAccount"
        :can-cancel="true"
      ></b-loading>
    </div>
  </div>
</template>

<script>
import { parsePhoneNumber, formatNational } from "~/plugins/phoneutil.js";
import { db, auth, firestore, functions } from "~/plugins/firebase.js";
import { ownPlateConfig } from "@/config/project";
import PhoneLogin from "~/app/auth/PhoneLogin";
import { lineAuthURL } from "~/plugins/line.js";

import HistoryButton from "@/components/users/HistoryButton";
import FavoriteButton from "@/components/users/FavoriteButton";

export default {
  components: {
    PhoneLogin,
    HistoryButton,
    FavoriteButton,
  },
  head() {
    return {
      title: [this.defaultTitle, "Profile"].join(" / ")
    }
  },
  data() {
    return {
      loginVisible: false,
      reLoginVisible: false,
      isFriend: undefined,
      isDeletingAccount: false,
      storedCard: null,
      detachStripe: null
    };
  },
  async created() {
    if (this.isLineUser) {
      this.checkFriend();
    }
    this.checkStripe();
  },
  destroyed() {
    this.detachStripe && this.detachStripe();
  },
  watch: {
    isWindowActive(newValue) {
      if (newValue && this.isLineUser && !this.isFriend) {
        this.isFriend = undefined;
        this.checkFriend();
      }
    },
    isLineUser(newValue) {
      if (this.isFriend === undefined) {
        this.checkFriend();
      }
    },
    user(newValue) {
      this.checkStripe();
      if (newValue) {
        // We need to unset this.loginVisible, because handleDismissed will not be called
        // on successful login
        this.loginVisible = false;
      }
    }
  },
  computed: {
    isWindowActive() {
      return this.$store.state.isWindowActive;
    },
    friendLink() {
      return ownPlateConfig.line.FRIEND_LINK;
    },
    claims() {
      return this.$store.state.claims;
    },
    cardDescription() {
      return this.storedCard
        ? `${this.storedCard.brand} ***${this.storedCard.last4}`
        : this.$t("profile.noCard");
    },
    lineConnection() {
      return this.isLineUser
        ? this.$t("profile.status.hasLine")
        : this.$t("profile.status.noLine");
    },
    lineFriend() {
      if (this.isFriend === undefined) {
        return this.$t("profile.status.verifying");
      }
      return this.isFriend
        ? this.$t("profile.status.isFriend")
        : this.$t("profile.status.noFriend");
    },
    displayName() {
      return this.user?.displayName || this.$t("profile.undefined");
    },
    loginStatus() {
      if (this.user) {
        if (this.user.email) {
          const extra = this.$store.getters.isSuperAdmin ? "*admin" : "";
          return `${this.$t("profile.status.email")}: ${
            this.user.email
          } ${extra}`;
        } else if (this.user.phoneNumber) {
          const number = parsePhoneNumber(this.user.phoneNumber);
          return `${this.$t("profile.status.phone")}: ${formatNational(
            number
          )}`;
        } else if (this.user.uid.slice(0, 5) === "line:") {
          return this.$t("profile.status.line");
        }
        return this.$t("profile.status.unexpected");
      }
      return this.$t("profile.status.none");
    }
  },
  methods: {
    checkStripe() {
      if (this.detachStripe) {
        this.detachStripe();
        this.detachStripe = null;
      }
      if (this.user && this.user.phoneNumber) {
        this.detachStripe = db
          .doc(`/users/${this.user.uid}/readonly/stripe`)
          .onSnapshot(snapshot => {
            const stripeInfo = snapshot.data();
            this.storedCard = stripeInfo?.card;
          });
      }
    },
    handleLineAuth() {
      const url = lineAuthURL("/callback/line", {
        pathname: location.pathname
      });
      location.href = url;
    },
    handleDeleteAccount() {
      this.$store.commit("setAlert", {
        code: "profile.reallyDeleteAccount",
        callback: async () => {
          window.scrollTo(0, 0);
          this.reLoginVisible = true;
        }
      });
    },
    handleDeleteCard() {
      this.$store.commit("setAlert", {
        code: "profile.reallyDeleteCard",
        callback: async () => {
          console.log("handleDeleteCard");
          this.$store.commit("setLoading", true);
          try {
            const stripeDeleteCard = functions.httpsCallable(
              "stripeDeleteCard"
            );
            const { data } = await stripeDeleteCard();
            console.log("stripeDeleteCard", data);
          } catch (error) {
            console.error(error);
          } finally {
            this.$store.commit("setLoading", false);
          }
        }
      });
    },
    async continueDelete(result) {
      console.log(result);
      this.reLoginVisible = false;
      if (result) {
        this.isDeletingAccount = true;
        try {
          const accountDelete = functions.httpsCallable("accountDelete");
          const { data } = await accountDelete();
          console.log("deleteAccount", data);
          await this.user.delete();
          console.log("deleted");
        } catch (error) {
          console.error(error);
        } finally {
          this.isDeletingAccount = false;
        }
      }
    },
    handleSignIn() {
      window.scrollTo(0, 0);
      this.loginVisible = true;
    },
    handleSignOut() {
      console.log("handleSignOut");
      auth.signOut();
    },
    handleDismissed() {
      console.log("handleDismissed");
      this.loginVisible = false;
    },
    async checkFriend() {
      const lineVerifyFriend = functions.httpsCallable("lineVerifyFriend");
      try {
        const { data } = await lineVerifyFriend({});
        this.isFriend = data.result;
      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>
