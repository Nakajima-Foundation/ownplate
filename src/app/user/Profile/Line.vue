<template>
  <div>
    <!-- LINE -->
    <div class="mt-6 rounded-lg bg-black bg-opacity-5 p-4">
      <!-- LINE Status -->
      <div class="text-center">
        <div class="text-sm font-bold text-black text-opacity-30">
          {{ $t("profile.lineConnection") }}
        </div>

        <div class="mt-2 text-base font-bold">
          {{ lineConnection }}
        </div>
      </div>
    </div>

    <div>
      <!-- LINE Connected -->
      <div v-if="isLineUser || isLiffUser">
        <!-- Friend Status -->
        <div class="mt-4 text-center">
          <div class="text-sm font-bold text-black text-opacity-30">
            {{ $t("profile.lineFriend") }}
          </div>

          <div class="mt-2 text-base font-bold">
            {{ lineFriend }}
          </div>
        </div>

        <!-- Not Friend -->
        <div v-if="isFriend === false" class="mt-4 text-center">
          <!-- external Friend link -->
          <o-button tag="a" :href="friendLink" class="b-reset-tw">
            <div
              class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
              style="background: #18b900"
            >
              <i class="fab fa-line mr-2 text-2xl text-white" />
              <div class="text-sm font-bold text-white">
                {{ $t("profile.friendLink") }}
              </div>
            </div>
          </o-button>
        </div>
      </div>

      <!-- LINE Not Connected -->

      <div v-if="!inLiff && (!isLineUser || underConstruction)">
        <div v-if="isLineEnabled" class="mt-4 text-center">
          <div
            v-if="isLineUser && underConstruction"
            class="mb-2 text-base font-bold"
          >
            再設定 for Dev
          </div>
          <o-button @click="handleLineAuth" class="b-reset-tw">
            <div
              class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
              style="background: #18b900"
            >
              <i class="fab fa-line mr-2 text-2xl text-white" />
              <div class="text-sm font-bold text-white">
                {{ $t("line.notifyMe") }}
              </div>
            </div>
          </o-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from "vue";
import {
  useIsLineUser,
  useIsLiffUser,
  useInLiff,
  useLiffIndexId,
  underConstruction,
} from "@/utils/utils";

import { lineVerifyFriend } from "@/lib/firebase/functions";
import { lineAuthURL } from "@/lib/line/line";
import { ownPlateConfig } from "@/config/project";

import { useStore } from "vuex";
import { useI18n } from "vue-i18n";

export default defineComponent({
  setup() {
    const store = useStore();
    const { t } = useI18n({ useScope: 'global' });

    const isLineUser = useIsLineUser();
    const isLiffUser = useIsLiffUser();
    const liffIndexId = useLiffIndexId();

    const inLiff = useInLiff();
    const isFriend = ref(undefined);
    const liffConfig = ref(null);

    const isWindowActive = computed(() => {
      return store.state.isWindowActive;
    });

    const friendLink = computed(() => {
      // TODO liff.
      if (isLiffUser.value) {
        if (liffConfig.value) {
          return liffConfig.value.friendUrl;
        }
      } else {
        return ownPlateConfig.line.FRIEND_LINK;
      }
    });
    const handleLineAuth = () => {
      const url = lineAuthURL("/callback/line", {
        pathname: location.pathname,
      });
      location.href = url;
    };
    const checkFriend = async () => {
      if (isLiffUser.value) {
        try {
          const res = await liff.getFriendship();
          isFriend.value = res.friendFlag;
        } catch (error) {
          console.log(error);
          // alert(JSON.stringify(error));
        }
      } else {
        try {
          const { data } = await lineVerifyFriend(
            isLiffUser.value ? { liffIndexId: liffIndexId.value } : {}
          );
          isFriend.value = data.result;
        } catch (error) {
          console.error(error);
        }
      }
    };

    const lineConnection = computed(() => {
      return isLineUser.value
        ? t("profile.status.hasLine")
        : t("profile.status.noLine");
    });

    const lineFriend = computed(() => {
      if (isFriend.value === undefined) {
        return t("profile.status.verifying");
      }
      return isFriend.value
        ? t("profile.status.isFriend")
        : t("profile.status.noFriend");
    });

    watch(isWindowActive, (newValue) => {
      if (
        newValue &&
        (isLineUser.value || isLiffUser.value) &&
        !isFriend.value
      ) {
        isFriend.value = undefined;
        checkFriend();
      }
    });
    watch(isLineUser, (newValue) => {
      if (isFriend.value === undefined) {
        checkFriend();
      }
    });
    watch(isLiffUser, (newValue) => {
      if (isFriend.value === undefined) {
        checkFriend();
      }
    });

    const init = async () => {
      if (isLineUser.value || isLiffUser.value) {
        checkFriend();
      }
      if (inLiff.value) {
        liffConfig.value = (
          await getDoc(doc(db, `liff/${liffIndexId.value}`))
        ).data();
      }
    };
    init();

    return {
      lineConnection,
      lineFriend,

      isFriend,
      handleLineAuth,
      friendLink,

      underConstruction,
    };
  },
});
</script>
