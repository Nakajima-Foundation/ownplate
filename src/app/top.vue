<template>
  <div>
    <!-- For Super Admin -->
    <div v-if="$store.getters.isSuperAdmin" class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-6"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="ml-6 mr-6 mt-6">
          <div class="bg-black bg-opacity-5 rounded-lg pl-6 pr-6 pt-6 pb-6">
            <!-- Go to Super Admin Page -->
            <div class="text-center">
              <router-link to="/s">
                <div class="op-button-small bg-op-teal shadow-lg" style="min-width: 256px">
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
    <div v-if="$store.getters.isOperator" class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-6"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="ml-6 mr-6 mt-6">
          <div class="bg-black bg-opacity-5 rounded-lg pl-6 pr-6 pt-6 pb-6">
            <!-- Go to Super Admin Page -->
            <div class="text-center">
              <router-link to="/op">
                <div class="op-button-small bg-op-teal shadow-lg" style="min-width: 256px">
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

    <lp-customer v-if="isCustomer" />
    <lp-admin v-else-if="isAdmin" />
    <lp v-else="isAdmin" />
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";

import Lp from "@/app/home/Lp.vue";
import LpAdmin from "@/app/home/LpAdmin.vue";
import LpCustomer from "@/app/home/LpCustomer.vue";

import { defaultTitle, isJapan } from "@/utils/utils";

export default defineComponent({
  metaInfo() {
    return {
      title: [defaultTitle, "Top"].join(" / "),
    };
  },

  components: {
    Lp,
    LpAdmin,
    LpCustomer,
  },
  setup() {
    return { isJapan };
  },
});
</script>
