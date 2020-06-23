<template>
  <div>
    <!-- Profile Body Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="columns is-gaplress">
          <div class="column is-three-fifths is-offset-one-fifth">
            <div class="m-l-24 m-r-24">
              <!-- Profile Card -->
              <div class="t-h6 c-text-black-disabled m-t-24 m-b-8">{{ $t("profile.title") }}</div>
              <div class="bg-surface r-8 d-low p-l-24 p-r-24 p-t-24 p-b-24">
                <!-- Login Status -->
                <div class="align-center">
                  <div
                    class="t-subtitle2 c-text-black-disabled p-b-8"
                  >{{ $t("profile.loginStatus") }}</div>
                  <div class="t-subtitle1 c-text-black-high">{{ loginStatus }}</div>
                </div>

                <!-- Not Signed In -->
                <div v-if="!user">
                  <!-- Sign In as a User -->
                  <div class="align-center m-t-24">
                    <div class="op-button-medium secondary" @click.prevent="handleSignIn">
                      <i class="material-icons m-r-8">tag_faces</i>
                      <span>{{ $t("profile.signIn") }}</span>
                    </div>
                  </div>

                  <!-- Sign In as a Restaurant -->
                  <div class="align-center m-t-24">
                    <router-link to="/admin/user/signin">
                      <div class="op-button-medium secondary">
                        <i class="material-icons m-r-8">store</i>
                        <span>{{ $t("profile.signInRestaurant") }}</span>
                      </div>
                    </router-link>
                  </div>

                  <!-- Phone Login-->
                  <b-modal :active.sync="loginVisible" :width="488" scroll="keep">
                    <div class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
                      <phone-login v-on:dismissed="handleDismissed" />
                    </div>
                  </b-modal>
                </div>

                <!-- Signed In -->
                <div v-if="user && claims">
                  <!-- <b-field class="m-t-8" :label="$t('profile.displayName')">
                    <p>{{ displayName }}</p>
                  </b-field>-->

                  <div v-if="user.phoneNumber">
                    <!-- Credit Card Info -->
                    <div class="align-center p-t-16">
                      <div
                        class="t-subtitle2 c-text-black-disabled p-b-8"
                      >{{ $t("profile.stripeInfo") }}</div>
                      <div class="t-subtitle1 c-text-black-high">{{ cardDescription }}</div>
                      <div v-if="storedCard">
                        <b-button class="b-reset op-button-text" @click="handleDeleteCard">
                          <i class="material-icons c-status-red">delete</i>
                          <span class="c-status-red">
                            {{
                            $t("profile.deleteCard")
                            }}
                          </span>
                        </b-button>
                      </div>
                    </div>

                    <!-- LINE -->
                    <div class="bg-form r-8 p-l-16 p-r-16 p-t-24 p-b-24 m-t-24">
                      <!-- LINE Status -->
                      <div class="align-center">
                        <div
                          class="t-subtitle2 c-text-black-disabled p-b-8"
                        >{{ $t("profile.lineConnection") }}</div>
                        <div class="t-subtitle1 c-text-black-high">{{ lineConnection }}</div>
                      </div>

                      <!-- LINE Connected -->
                      <div v-if="isLineUser">
                        <!-- Friend Status -->
                        <div class="m-t-24 align-center">
                          <div
                            class="t-subtitle2 c-text-black-disabled p-b-8"
                          >{{ $t("profile.lineFriend") }}</div>
                          <div class="t-subtitle1 c-text-black-high">{{ lineFriend }}</div>
                        </div>

                        <!-- Not Friend -->
                        <div v-if="isFriend === false" class="align-center m-t-16">
                          <b-button
                            class="b-reset op-button-small"
                            style="background:#18b900"
                            tag="a"
                            :href="friendLink"
                          >
                            <i
                              class="fab fa-line c-text-white-full m-l-24 m-r-8"
                              style="font-size:24px"
                            />
                            <span class="c-text-white-full m-r-24">{{ $t("profile.friendLink") }}</span>
                          </b-button>
                        </div>
                      </div>

                      <!-- LINE Not Connected -->
                      <div v-else>
                        <div v-if="isLineEnabled" class="align-center m-t-24">
                          <b-button
                            class="b-reset op-button-small"
                            style="background:#18b900"
                            @click="handleLineAuth"
                          >
                            <i
                              class="fab fa-line c-text-white-full m-l-24 m-r-8"
                              style="font-size:24px"
                            />
                            <span class="c-text-white-full m-r-24">{{ $t("line.notifyMe") }}</span>
                          </b-button>
                        </div>
                      </div>
                    </div>

                    <!-- Order History -->
                    <div class="align-center m-t-24">
                      <router-link to="/u/history">
                        <div
                          class="op-button-medium primary"
                          style="min-width: 256px;"
                        >{{ $t("order.history") }}</div>
                      </router-link>
                    </div>
                  </div>

                  <!-- Sign Out -->
                  <div class="align-center m-t-48">
                    <div
                      class="op-button-small tertiary"
                      @click.prevent="handleSignOut"
                    >{{ $t("menu.signOut") }}</div>
                  </div>

                  <!-- Delete Account and Phone Login -->
                  <div v-if="user.phoneNumber">
                    <!-- Delete Account -->
                    <div class="m-t-16 align-center">
                      <b-button class="b-reset op-button-text" @click="handleDeleteAccount">
                        <i class="material-icons c-status-red">delete</i>
                        <span class="c-status-red">
                          {{
                          $t("profile.deleteAccount")
                          }}
                        </span>
                      </b-button>
                    </div>

                    <!-- Phone Login-->
                    <b-modal :active.sync="reLoginVisible" :width="488" scroll="keep">
                      <div class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
                        <phone-login v-on:dismissed="continueDelete" :relogin="user.phoneNumber" />
                      </div>
                    </b-modal>
                  </div>
                </div>

                <!-- Loading -->
                <b-loading :is-full-page="false" :active="isDeletingAccount" :can-cancel="true"></b-loading>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>
  </div>
</template>

<script>
import { parsePhoneNumber, formatNational } from "~/plugins/phoneutil.js";
import { db, auth, firestore, functions } from "~/plugins/firebase.js";
import { ownPlateConfig } from "@/config/project";
import PhoneLogin from "~/app/auth/PhoneLogin";
import { lineAuthURL } from "~/plugins/line.js";

export default {
  components: {
    PhoneLogin
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
