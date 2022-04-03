<template>
  <div>
    <div v-if="error === 'redirect_liff'">redirecting....</div>
    <div v-else-if="error === 'no_liff'">no liff</div>
    <div v-else-if="error === 'no_restaurant'">
      <not-found />
    </div>
    <div v-else-if="error === 'pc'">
      <PC :liffUrl="liffUrl" />
    </div>
    <div v-else-if="loading">loading...</div>
    <div v-else>
      <modal v-if="openModal">
        <div class="w-96 h-48 relative flex items-center">
          <div class="flex flex-1 w-full justify-center">
            <a :href="friendUrl">
              {{ $t("line.registerAsAFriend") }}
            </a>
          </div>
        </div>
      </modal>
      <router-view :config="config" v-if="user" />
    </div>
  </div>
</template>

<script>
import liff from "@line/liff";
import { db, auth } from "~/plugins/firebase";

import { functionsJP } from "@/lib/firebase/firebase9";
import { httpsCallable } from "firebase/functions";

import queryString from "query-string";

import PC from "./PC.vue";
import NotFound from "~/components/NotFound";

import Modal from "~/components/Modal";

/*
 liff flow
 1. load liff config
   -> if not liff app, then go error page.
 1.1. check valid restaurantId if params has restaurantId
 2. check if it is in liff
   -> if not in liff
      redirect to liff if sp
      redirect to pc page if pc
 3. do liff auth
 4. check firebase auth
   -> if firebase liff user, go ap
   -> if not, do firebas auth
 5. everything ok
*/

const getOS = () => {
  const os = liff.getOS();
  const isAndroid = os === "android";
  const isIOS = os === "ios";
  const isWeb = os === "web";
  return {
    os,
    isAndroid,
    isIOS,
    isWeb,
  };
};

const parseLiffState = (liffstate) => {
  if (!liffstate) return {};
  const splited = liffstate.split("?");
  if (splited.length < 2) {
    return {
      liffStatePath: splited[0] || "",
      liffStateQuery: {},
    };
  }
  return {
    liffStatePath: splited[0],
    liffStateQuery: queryString.parse(splited[1]),
  };
};

export default {
  components: {
    PC,
    Modal,
    NotFound,
  },
  data() {
    return {
      error: null,
      liffUrl: "",
      loading: true,
      config: null,
      liffId: "",
      liffIdToken: "",
      // openModal: true,
      openModal: false,
    };
  },
  async created() {
    // step 1.
    const loadLiffConfig = async () => {
      const data = (await db.doc(`/liff/${this.liffIndexId}`).get()).data();
      return data;
    };

    // step 2
    const checkInLiff = () => {
      const { liffStatePath, liffStateQuery } = parseLiffState(
        this.$route.query["liff.state"]
      );

      // https://staging.ownplate.today/liff/test/r/123 -> https://liff.line.me/1656180429-yJ8ZmlBv/r/123
      const omochikaeriLiffBasePath = "/liff/" + this.liffIndexId; // /liff/test
      const relativePath = window.location.pathname.slice(
        omochikaeriLiffBasePath.length
      ); // /r/123
      this.liffUrl = "https://liff.line.me/" + this.liffId + relativePath; // 1656180429-yJ8ZmlBv/r/123

      if (!liff.isInClient()) {
        const { isWeb, isIOS, isAndroid } = getOS();
        if (liffStateQuery && liffStateQuery["redirect"]) {
          this.liffUrl = "https://liff.line.me/" + this.liffId + liffStatePath;
          this.error = "pc";
          return false;
        }

        if (isIOS || isAndroid) {
          const params = { ...this.$route.query };
          params["redirect"] = "true";
          const qs = Object.keys(params)
            .map((key) => {
              return key + "=" + encodeURIComponent(params[key]);
            })
            .join("&");

          location.replace(this.liffUrl + "?" + qs);
          this.error = "redirect_liff";
          return false;
        }
        if (location.hostname === "localhost") {
          // for debug
          return true;
        }
        this.error = "pc";
        return false;
      }
      return true;
    };

    // step3
    const liffInit = async () => {
      if (location.hostname === "localhost") {
        return;
      }
      await liff.init({ liffId: this.liffId });
      try {
        if (!liff.isLoggedIn()) {
          liff.login();
        }
        this.liffIdToken = await liff.getIDToken();
      } catch (e) {
        console.log("liff_login", e);
      }
    };

    // step 1.
    this.config = await loadLiffConfig();

    if (this.config === null || this.config === undefined) {
      this.error = "no_liff";
      return;
    }

    // step 1.1.
    if (this.$route.params.restaurantId) {
      const hasRestaurant = (this.config.restaurants || []).some(
        (restaurantId) => {
          return restaurantId === this.$route.params.restaurantId;
        }
      );
      if (!hasRestaurant) {
        this.error = "no_restaurant";
        return;
      }
    }

    if (location.hostname == !"localhost") {
      // if not liff user, force sign out
      if (this.user && !this.isLiffUser) {
        auth.signOut();
      }
    }

    this.liffId = this.config.liffId;
    // step 2.
    if (!checkInLiff()) {
      return;
    }
    // step 3.
    await liffInit(this.config);

    if (location.hostname === "localhost") {
      this.loading = false;
    }
  },
  computed: {
    userLoad() {
      return [this.$store.state.user, this.liffIdToken];
    },
    user() {
      return this.$store.state.user;
    },
    friendUrl() {
      if (this.config) {
        return this.config.friendUrl;
      }
      return null;
    },
  },
  watch: {
    userLoad(value) {
      if (this.$store.state.user !== undefined && this.liffIdToken !== "") {
        if (this.$store.state.user === null) {
          const liffAuthenticate = httpsCallable(
            functionsJP,
            "liffAuthenticate"
          );
          (async () => {
            const { data } = await liffAuthenticate({
              liffIndexId: this.liffIndexId,
              liffId: this.liffId,
              token: this.liffIdToken,
            });
            if (data.customToken) {
              const user = await auth.signInWithCustomToken(data.customToken);
            }
            this.loading = false;
          })();
        } else {
          // force sign out if current user is not cuurrent liff user
          if (this.config.liffId !== this.userLiffId) {
            auth.signOut();
          }
          this.loading = false;
        }
        if (location.hostname !== "localhost") {
          liff.getFriendship().then((friendship) => {
            this.openModal = !friendship.friendFlag;
          });
        }
      }
    },
  },
};
</script>
