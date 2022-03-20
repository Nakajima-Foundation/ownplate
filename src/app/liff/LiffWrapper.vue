<template>
  <div>
<div v-if="error === 'no_liff'">
  no liff
</div>
<div v-if="error === 'pc'">
  pc
</div>
<div v-else>
  <router-view />
</div>
</div>
</template>

<script>
import liff from "@line/liff";

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
  data() {
    return {
      error: null,
    };
  },
  async created() {

    // step 1.
    const loadLiffConfig = () => {
      const id = this.$route.params.indexId;
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

    const checkInLiff = () => {
      if (!liff.isInClient()) {
        const { isWeb, isIOS, isAndroid } = getOS();
        // TODO redirect to liff or show pc
        /*
        if (liffStateQuery && liffStateQuery["redirect"]) {
          const path = liffStatePath || "";
          if (path.startsWith("/map")) {
            router.push(shareTopPath + path);
          }
          return { isPC: true };
        }
        */
        if (isIOS || isAndroid) {
          const params = { ...this.$route.query};
          params["redirect"] = "true";
          const qs = Object.keys(params)
                .map((key) => {
                  return key + "=" + encodeURIComponent(params[key]);
                })
                .join("&");
          // TODO
          // window.location.pathname
          // https://staging.ownplate.today/liff/test
          const liffUrl = "https://liff.line.me/1656180429-yJ8ZmlBv/r/fgaz8vntMltJo8hEfsDk";
          // hoge.com/liff/aaa/bbb -> liff.com/liffprefix/bbb
          location.replace(liffUrl + "?" + qs);
          return false;
        }
        if (isWeb) {
          this.error = "pc";
        }
        if (location.hostname === "localhost") {
          // for debug
          return true;
        }
        return false;
      }
      return true;
    };

    const liffInit = (config) => {
      if (location.hostname === "localhost") {
        return;
      }
      liff.init({ liffId: config.liffId }).then(async () => {
        try {
          if (!liff.isLoggedIn()) {
            liff.login();
          }
          const liffIdToken = await liff.getIDToken();
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
    // step 2.
    if (!checkInLiff()) {
      this.error = "pc";
      return;
    }
    // step 3.
    liffInit(config);
}
};
</script>
