<template>
  <div>
    <template v-if="notFound === null"></template>
    <template v-else-if="notFound === true">
      <not-found />
    </template>
    <div v-else-if="notFound === false">
      <div class="mx-6 mt-4">
        <div class="mt-4">
          <div class="pb-2 text-sm font-bold">
            {{ $t("editEC.postageList") }}
          </div>

          <div class="rounded-lg bg-black/5 p-4">
            <div
              v-for="(state, key) in regionalSetting.AddressStates"
              class="flex"
              :key="key"
            >
              <span class="w-2/12">{{ state }}</span>
              <input
                class="w-4/12 rounded-lg border border-gray-300 px-3 py-2 dark:bg-black dark:text-gray-200"
                :class="{ 'py-3': key === 0 }"
                v-model="postage[key]"
              />
              <button
                @click="copy(key)"
                v-if="key !== 0"
                class="bg-op-teal my-1 ml-2 cursor-pointer rounded-lg px-3 py-2 text-white"
              >
                {{ $t("editEC.copy") }}
              </button>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <div class="pb-2 text-sm font-bold">
            {{ $t("editEC.freeThreshold") }}
          </div>
          <div class="rounded-lg bg-black/5 p-4">
            <div class="mb-2 flex">
              <o-checkbox v-model="enableFree" class="flex-item" />
              <span class="flex-item mt-auto mb-auto inline-block">
                {{ $t("editEC.setPostageFreeThreshold") }}
              </span>
            </div>
            <input
              class="w-4/12 rounded-lg border border-gray-300 px-3 py-2 dark:bg-black dark:text-gray-200"
              v-model="freeThreshold"
              :disabled="!enableFree"
              :class="!enableFree ? 'bg-gray-100' : ''"
            />
          </div>
        </div>

        <!-- Save Button -->
        <div class="mt-4 text-center">
          <button @click="savePostage" class="cursor-pointer">
            <div
              class="bg-op-teal inline-flex h-12 items-center justify-center rounded-full px-6 shadow-sm"
              style="min-width: 8rem"
            >
              <span class="text-base font-bold text-white">{{
                $t("editCommon.save")
              }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc, setDoc } from "firebase/firestore";

import {
  useAdminUids,
  notFoundResponse,
  useRestaurantId,
  regionalSetting,
} from "@/utils/utils";
import { checkShopAccount } from "@/utils/userPermission";

import NotFound from "@/components/NotFound.vue";

export default defineComponent({
  components: {
    NotFound,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const postage = ref(Array.from([...Array(47)]).map(() => 0));
    const enableFree = ref(false);
    const freeThreshold = ref(100000);

    const { uid, ownerUid } = useAdminUids();

    if (!checkShopAccount(props.shopInfo, ownerUid.value)) {
      return notFoundResponse;
    }

    const restaurantId = useRestaurantId();

    getDoc(doc(db, `restaurants/${restaurantId.value}/ec/postage`)).then(
      (postageDoc) => {
        if (postageDoc.exists()) {
          const data = postageDoc.data();
          if (data) {
            if (data.postageList) {
              postage.value = data.postageList.default;
            }
            if (data.freeThreshold) {
              enableFree.value = true;
              freeThreshold.value = data.freeThreshold;
            }
          }
        }
      },
    );

    const copy = (key: number) => {
      const newArray = [...postage.value];
      if (key === 0) {
        newArray[key] = postage.value[postage.value.length - 1];
      } else {
        newArray[key] = postage.value[key - 1];
      }
      postage.value = newArray;
    };
    const savePostage = async () => {
      const data = {
        uid: uid.value,
        postageList: {
          default: postage.value,
        },
        freeThreshold: enableFree.value ? freeThreshold.value : null,
      };
      await setDoc(
        doc(db, `restaurants/${restaurantId.value}/ec/postage`),
        data,
      );
    };
    return {
      postage,
      enableFree,
      freeThreshold,
      notFound: false,

      copy,
      savePostage,
      regionalSetting,
    };
  },
});
</script>
