<template>
  <div>
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
    </div>

    <div>
      <!-- LINE Connected -->
      <div v-if="isLineUser || isLiffUser">
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
          <!-- external Friend link -->
          <b-button tag="a" :href="friendLink" class="b-reset-tw">
            <div
              class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
              style="background: #18b900"
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

      <div v-if="!inLiff && (!isLineUser || underConstruction)">
        <div v-if="isLineEnabled" class="mt-4 text-center">
          <div
            v-if="isLineUser && underConstruction"
            class="text-base font-bold mb-2"
          >
            再設定 for Dev
          </div>
          <b-button @click="handleLineAuth" class="b-reset-tw">
            <div
              class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
              style="background: #18b900"
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
</template>

<script>
import { defineComponent, ref, computed, watch } from "@vue/composition-api";
import {
  useIsLineUser,
  useIsLiffUser,
  useInLiff,
  useLiffIndexId,
} from "@/utils/utils";

import { lineVerifyFriend } from "@/lib/firebase/functions";
import { lineAuthURL } from "@/lib/line/line";
import { ownPlateConfig } from "@/config/project";

export default defineComponent({
  setup(_, ctx) {
    const isLineUser = useIsLineUser(ctx);
    const isLiffUser = useIsLiffUser(ctx);
    const liffIndexId = useLiffIndexId(ctx.root);

    const inLiff = useInLiff(ctx);
    const isFriend = ref(undefined);
    const liffConfig = ref(null);

    const isWindowActive = computed(() => {
      return ctx.root.$store.state.isWindowActive;
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
        ? ctx.root.$t("profile.status.hasLine")
        : ctx.root.$t("profile.status.noLine");
    });

    const lineFriend = computed(() => {
      if (isFriend.value === undefined) {
        return ctx.root.$t("profile.status.verifying");
      }
      return isFriend.value
        ? ctx.root.$t("profile.status.isFriend")
        : ctx.root.$t("profile.status.noFriend");
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
    };
  },
});
</script>
