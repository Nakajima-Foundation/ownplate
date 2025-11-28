<template>
  <div>
    <!-- For Super Admin -->
    <div v-if="userStore.isSuperAdmin" class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-6"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="mx-6 mt-2">
          <div class="rounded-lg bg-black/5 pt-6 pr-6 pb-6 pl-6">
            <!-- Go to Super Admin Page -->
            <div class="text-center">
              <router-link to="/s">
                <div
                  class="bg-op-teal inline-flex h-12 min-h-[36px] min-w-[256px] cursor-pointer items-center justify-center rounded-full px-6 text-base font-bold shadow-lg"
                >
                  <span class="text-white">Super Admin Page</span>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-6"></div>
    </div>

    <!-- For Operator -->
    <div v-if="userStore.isOperator" class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-6"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="mx-6 mt-2">
          <div class="rounded-lg bg-black/5 pt-6 pr-6 pb-6 pl-6">
            <!-- Go to Super Admin Page -->
            <div class="text-center">
              <router-link to="/op">
                <div
                  class="bg-op-teal inline-flex h-12 min-h-[36px] min-w-[256px] cursor-pointer items-center justify-center rounded-full px-6 text-base font-bold shadow-lg"
                >
                  <span class="text-white">Operator Page</span>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-6"></div>
    </div>

    <lp :isAdmin="userStore.isAdmin" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user";

import Lp from "@/app/home/Lp.vue";
// import LpAdmin from "@/app/home/LpAdmin.vue";
//import LpCustomer from "@/app/home/LpCustomer.vue";

import { defaultTitle, sleep } from "@/utils/utils";
import { useHead } from "@unhead/vue";

export default defineComponent({
  components: {
    Lp,
    // LpAdmin,
    // LpCustomer,
  },
  setup() {
    useHead(() => ({
      title: [defaultTitle, "Top"].join(" / "),
    }));
    const userStore = useUserStore();

    (async () => {
      await sleep(0.1);
      window.scrollTo(0, 0);
    })();
    return {
      userStore,
    };
  },
});
</script>
