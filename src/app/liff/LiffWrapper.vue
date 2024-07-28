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
        <div class="relative flex h-48 w-96 items-center">
          <div class="flex w-full flex-1 justify-center">
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

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import liff from "@line/liff";
import { getDoc, doc } from "firebase/firestore";

import { db, auth } from "@/lib/firebase/firebase9";
import { signInWithCustomToken, signOut } from "firebase/auth";

import { liffAuthenticate } from "@/lib/firebase/functions";

import queryString from "query-string";

import PC from "@/app/liff/PC.vue";
import NotFound from "@/components/NotFound.vue";

import Modal from "@/components/Modal.vue";

import { useUserData } from "@/utils/utils";

import { useStore } from "vuex";
import { useRoute } from "vue-router";

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

const parseLiffState = (liffstate: string) => {
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

export default defineComponent({
  components: {
    PC,
    Modal,
    NotFound,
  },
  setup() {
    const store = useStore();
    const route = useRoute();

    const error = ref<string | null>(null);
    const config = ref();
    const liffUrl = ref("");
    const openModal = ref(false);
    const loading = ref(true);
    const liffIdToken = ref("");
    const liffId = ref("");

    const { user, isLiffUser } = useUserData();

    // computed
    const userLoad = computed(() => {
      return [store.state.user, liffIdToken.value];
    });
    const friendUrl = computed(() => {
      if (config.value) {
        return config.value.friendUrl;
      }
      return null;
    });

    const liffIndexId = computed(() => {
      return route.params.liffIndexId as string;
    });
    const userLiffId = computed(() => {
      return store.getters.liffId;
    });

    watch(userLoad, () => {
      if (store.state.user !== undefined && liffIdToken.value !== "") {
        if (store.state.user === null) {
          (async () => {
            const { data } = await liffAuthenticate({
              liffIndexId: liffIndexId.value,
              liffId: liffId.value,
              token: liffIdToken.value,
            });
            if (data.customToken) {
              await signInWithCustomToken(auth, data.customToken);
            }
            loading.value = false;
          })();
        } else {
          // force sign out if current user is not cuurrent liff user
          if (config.value.liffId !== userLiffId.value) {
            signOut(auth);
          }
          loading.value = false;
        }
        if (location.hostname !== "localhost") {
          liff.getFriendship().then((friendship) => {
            openModal.value = !friendship.friendFlag;
          });
        }
      }
    });

    // step 1.
    const loadLiffConfig = async () => {
      const data = (await getDoc(doc(db, `/liff/${liffIndexId.value}`))).data();
      return data;
    };

    // step 2
    const checkInLiff = () => {
      const { liffStatePath, liffStateQuery } = parseLiffState(
        route.query["liff.state"] as string,
      );

      // https://staging.ownplate.today/liff/test/r/123 -> https://liff.line.me/1656180429-yJ8ZmlBv/r/123
      const omochikaeriLiffBasePath = "/liff/" + liffIndexId.value; // /liff/test
      const relativePath = window.location.pathname.slice(
        omochikaeriLiffBasePath.length,
      ); // /r/123
      liffUrl.value = "https://liff.line.me/" + liffId.value + relativePath; // 1656180429-yJ8ZmlBv/r/123

      if (!liff.isInClient()) {
        const { isIOS, isAndroid } = getOS();
        if (liffStateQuery && liffStateQuery["redirect"]) {
          liffUrl.value =
            "https://liff.line.me/" + liffId.value + liffStatePath;
          error.value = "pc";
          return false;
        }

        if (isIOS || isAndroid) {
          const params = { ...route.query };
          params["redirect"] = "true";
          const qs = Object.keys(params)
            .map((key) => {
              return key + "=" + encodeURIComponent(params[key] as string);
            })
            .join("&");

          location.replace(liffUrl.value + "?" + qs);
          error.value = "redirect_liff";
          return false;
        }
        if (location.hostname === "localhost") {
          // for debug
          return true;
        }
        error.value = "pc";
        return false;
      }
      return true;
    };

    // step3
    const liffInit = async () => {
      if (location.hostname === "localhost") {
        return;
      }
      await liff.init({ liffId: liffId.value });
      try {
        if (!liff.isLoggedIn()) {
          liff.login();
        }
        liffIdToken.value = (await liff.getIDToken()) as string;
      } catch (e) {
        console.log("liff_login", e);
      }
    };

    // step 1.
    (async () => {
      config.value = await loadLiffConfig();

      if (config.value === null || config.value === undefined) {
        error.value = "no_liff";
        return;
      }

      // step 1.1.
      if (route.params.restaurantId) {
        const hasRestaurant = (config.value.restaurants || []).some(
          (restaurantId: string) => {
            return restaurantId === route.params.restaurantId;
          },
        );
        if (!hasRestaurant) {
          error.value = "no_restaurant";
          return;
        }
      }

      if (location.hostname !== "localhost") {
        // if not liff user, force sign out
        if (user.value && !isLiffUser.value) {
          signOut(auth);
        }
      }

      liffId.value = config.value.liffId;
      // step 2.
      if (!checkInLiff()) {
        return;
      }
      // step 3.
      await liffInit();

      if (location.hostname === "localhost") {
        loading.value = false;
      }
    })();

    return {
      config,
      error,
      liffUrl,
      openModal,
      loading,
      friendUrl,
    };
  },
});
</script>
