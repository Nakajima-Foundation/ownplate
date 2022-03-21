<template>
  <div>
    <div v-if="error === 'redirect_liff'">
      redirecting....
    </div>
    <div v-else-if="error === 'no_liff'">
      no liff
    </div>
    <div v-else-if="error === 'pc'">
      <PC :liffUrl="liffUrl" />
    </div>
    <div v-else-if="loading">
      loading...
    </div>
    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script>
import liff from "@line/liff";
import { db, functions, auth } from "~/plugins/firebase.js";

import queryString from "query-string";

import PC from "./PC.vue";

/*
 liff flow
 1. load liff config
   -> if not liff app, then go error page.
 2. check if it is in liff and 
   -> if not liff
      redirect to liff if sp
      redirect to pc page if pc
 3. do liff auth
 4. check firebase auth
   -> if firebase liff user, go ap
   -> if not, do firebas auth
 5. everything ok
*/

export default {
  components: {
    PC,
  },
  data() {
    return {
      error: null,
      liffUrl: "",
      indexId: "",
      loading: true,
      liffId: "",
      liffIdToken: "",
    };
  },
  async created() {
    this.indexId = this.$route.params.indexId;

    // step 1.
    const loadLiffConfig = () => {
      // TODO get config from firestore
      return {
        liffId: "1656180429-yJ8ZmlBv",
      };
    };
    // step 2
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

    
    const checkInLiff = () => {
      const { liffStatePath, liffStateQuery } = parseLiffState(this.$route.query["liff.state"]);
      
      // https://staging.ownplate.today/liff/test/r/123 -> https://liff.line.me/1656180429-yJ8ZmlBv/r/123 
      const omochikaeriLiffBasePath = "/liff/" + this.indexId; // /liff/test
      const relativePath = window.location.pathname.slice(omochikaeriLiffBasePath.length); // /r/123
      this.liffUrl = "https://liff.line.me/" + this.liffId + relativePath // test/r/123
      
      if (!liff.isInClient()) {
        const { isWeb, isIOS, isAndroid } = getOS();
        if (liffStateQuery && liffStateQuery["redirect"]) {
          this.liffUrl = "https://liff.line.me/" + this.liffId + liffStatePath;
          this.error = "pc";
          return false;
        }

        if (isIOS || isAndroid) {
          const params = { ...this.$route.query};
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
          // return true;
        }
        this.error = "pc";
        return false;
      }
      return true;
    };

    const liffInit = () => {
      if (location.hostname === "localhost") {
        return;
      }
      liff.init({ liffId: this.liffId }).then(async () => {
        try {
          if (!liff.isLoggedIn()) {
            liff.login();
          }
          this.liffIdToken = await liff.getIDToken();
        } catch (e) {
          console.log("liff_login", e);
        }
      });
    };

    // step 1.
    const config = loadLiffConfig();
    if (config === null) {
      this.error = "no_liff";
      return;
    }
    this.liffId = config.liffId;
    // step 2.
    if (!checkInLiff()) {
      return;
    }
    // step 3.
    liffInit(config);

    this.loading = false;
  },
  computed: {
    userLoad() {
      return [this.$store.state.user, this.liffIdToken];
    },
  },
  watch: {
    userLoad(value) {
      if (this.$store.state.user !== undefined && this.liffIdToken !== undefined) {
        // TODO
        // not user or not liff user or not current liff user
        if (this.$store.state.user === null) {
          const liffAuthenticate = functions.httpsCallable("liffAuthenticate");
          (async () => {
            const { data } = (await liffAuthenticate({
              indexId: this.indexId,
              liffId: this.liffId,
              token: this.liffIdToken,
            }));
            if (data.customToken) {
              const user = await aith.signInWithCustomToken(data.customToken);
            }
          })();
        }
      }
    },
  }
};
</script>
