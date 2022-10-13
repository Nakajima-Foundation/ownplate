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

          <div class="rounded-lg bg-black bg-opacity-5 p-4">
            <div
              v-for="(state, key) in regionalSetting.AddressStates"
              class="flex"
            >
              <span class="w-2/12">{{ state }}</span>
              <b-input class="w-4/12" v-model="postage[key]" />
              <b-button @click="copy(key)" v-if="key !== 0">
                {{ $t("editEC.copy") }}
              </b-button>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <div class="pb-2 text-sm font-bold">
            {{ $t("editEC.freeThreshold") }}
          </div>
          <div class="rounded-lg bg-black bg-opacity-5 p-4">
            <div class="mb-2 flex">
              <b-checkbox v-model="enableFree" class="flex-item" />
              <span class="flex-item mt-auto mb-auto inline-block">
                {{ $t("editEC.setPostageFreeThreshold") }}
              </span>
            </div>
            <b-input
              class="w-4/12"
              v-model="freeThreshold"
              :disabled="!enableFree"
            />
          </div>
        </div>

        <!-- Save Button -->
        <div class="mt-4 text-center">
          <b-button @click="savePostage" class="b-reset-tw">
            <div
              class="inline-flex h-12 items-center justify-center rounded-full bg-op-teal px-6 shadow"
              style="min-width: 8rem"
            >
              <span class="text-base font-bold text-white">{{
                $t("editCommon.save")
              }}</span>
            </div>
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "@vue/composition-api";
import { db, firestore } from "@/plugins/firebase";
import { useAdminUids, notFoundResponse, getRestaurantId } from "@/utils/utils";
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
  setup(props, ctx) {
    const postage = ref(Array.from([...Array(47)]).map((k) => 0));
    const enableFree = ref(false);
    const freeThreshold = ref(100000);

    const { uid, ownerUid } = useAdminUids(ctx);

    if (!checkShopAccount(props.shopInfo, ownerUid.value)) {
      return notFoundResponse;
    }

    const restaurantId = getRestaurantId(ctx.root);

    db.doc(`restaurants/${restaurantId}/ec/postage`)
      .get()
      .then((postageDoc) => {
        if (postageDoc.exists) {
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
      });

    const copy = (key) => {
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
      await db.doc(`restaurants/${restaurantId}/ec/postage`).set(data);
    };
    return {
      postage,
      enableFree,
      freeThreshold,
      notFound: false,

      copy,
      savePostage,
    };
  },
});
</script>
