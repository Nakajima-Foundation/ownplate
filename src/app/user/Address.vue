<template>
  <div class="mx-6 mt-6 lg:max-w-2xl lg:mx-auto">
    <!-- Title -->
    <div class="text-xl font-bold text-black text-opacity-30">
      {{ $t("profile.address") }}
    </div>
    
    <!-- Card -->
    <div class="bg-white rounded-lg shadow mt-2 p-6">
      <div class="text-sm font-bold">
        {{ $t("order.ec.zip") }} 
      </div>
      <div class="mt-1 mb-2">
        {{customerInfo.zip || '----'}}
      </div>
      <!-- address -->
      <div class="text-sm font-bold">
        {{ $t("order.ec.address") }}
      </div>
      <div class="mt-1 mb-2">
        {{customerInfo.prefecture}}
        {{customerInfo.address || '----'}}
      </div>
      <div class="text-sm font-bold">
        {{ $t("order.ec.name") }}
      </div>
      <div class="mt-1 mb-2">
        {{customerInfo.name || '----'}}
      </div>
      <div class="text-center">
        <b-button
          @click="resetAddress"
          class="b-reset-tw"
          >
          <div
            class="inline-flex justify-center items-center h-16 px-6 rounded-full bg-op-teal shadow"
            style="min-width: 288px;"
            >
            <div class="text-xl font-bold text-white">
              {{ $t("profile.resetAddress") }}
            </div>
          </div>
        </b-button>
      </div>
      <div class="text-center mt-2 font-bold">
        * {{ $t("profile.resetAddressMessage") }}
      </div>
      <div class="text-center font-bold">
         {{ $t("profile.resetAddressModify") }}
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "~/plugins/firebase.js";

export default {
  async created() {
    const uid = this.user.uid;
    const data = (await db.doc(this.docPath).get()).data();
    this.customerInfo = data;
  },
  data() {
    return {
      customerInfo: {},
    };
  },
  computed: {
    docPath() {
      const uid = this.user.uid;
      return `/users/${uid}/address/data`;
    },
  },
  methods: {
    async resetAddress() {
      await db.doc(this.docPath).set({});
      this.customerInfo = {};
    },
  }
}
</script>
