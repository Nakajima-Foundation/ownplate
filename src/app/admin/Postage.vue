<template>
  <div class="mt-4 mx-6">
    <div class="mt-4">
      <div class="text-sm font-bold pb-2">
        {{ $t("editEC.postageList") }}
      </div>

      <div class="bg-black bg-opacity-5 rounded-lg p-4">
        <div v-for="(state, key) in regionalSetting.AddressStates" class="flex">
          <span class="w-2/12">{{ state }}</span>
          <b-input class="w-4/12" v-model="postage[key]" />
          <b-button @click="copy(key)" v-if="key !== 0">
            {{ $t("editEC.copy") }}
          </b-button>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <div class="text-sm font-bold pb-2">
        {{ $t("editEC.freeThreshold") }}
      </div>
      <div class="bg-black bg-opacity-5 rounded-lg p-4">
        <div class="flex mb-2">
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
          class="h-12 rounded-full bg-op-teal inline-flex justify-center items-center px-6 shadow"
          style="min-width: 8rem"
        >
          <span class="text-white text-base font-bold">{{
            $t("editCommon.save")
          }}</span>
        </div>
      </b-button>
    </div>
  </div>
</template>

<script>
import { db, firestore } from "~/plugins/firebase";
export default {
  data() {
    return {
      postage: Array.from([...Array(47)]).map((k) => 0),
      enableFree: false,
      freeThreshold: 100000,
    };
  },
  computed: {
    uid() {
      return this.$store.getters.uidAdmin;
    },
  },
  methods: {
    copy(key) {
      const newArray = [...this.postage];
      if (key === 0) {
        newArray[key] = this.postage[this.postage.length - 1];
      } else {
        newArray[key] = this.postage[key - 1];
      }
      this.postage = newArray;
    },
    async savePostage() {
      console.log(this.postage);
      const data = {
        uid: this.uid,
        postageList: {
          default: this.postage,
        },
        freeThreshold: this.enableFree ? this.freeThreshold : null,
      };
      await db.doc(`restaurants/${this.restaurantId()}/ec/postage`).set(data);
    },
  },
  async created() {
    const postageDoc = await db
      .doc(`restaurants/${this.restaurantId()}/ec/postage`)
      .get();
    if (postageDoc.exists) {
      const data = postageDoc.data();
      if (data) {
        if (data.postageList) {
          this.postage = data.postageList.default;
        }
        if (data.freeThreshold) {
          this.enableFree = true;
          this.freeThreshold = data.freeThreshold;
        }
      }
    }
  },
};
</script>
