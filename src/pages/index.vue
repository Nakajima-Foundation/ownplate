<template>
  <div>
    <!-- For Super Admin -->
    <div v-if="$store.getters.isSuperAdmin" class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-6"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24 m-t-24">
          <div class="bg-form rounded-lg p-l-24 p-r-24 p-t-24 p-b-24">
            <!-- Go to Super Admin Page -->
            <div class="align-center">
              <router-link to="/s">
                <div class="op-button-small primary" style="min-width: 256px;">
                  <span class="c-onprimary">Super Admin Page</span>
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
        <div class="m-l-24 m-r-24 m-t-24">
          <div class="bg-form rounded-lg p-l-24 p-r-24 p-t-24 p-b-24">
            <!-- Go to Super Admin Page -->
            <div class="align-center">
              <router-link to="/op">
                <div class="op-button-small primary" style="min-width: 256px;">
                  <span class="c-onprimary">Operator Page</span>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-6"></div>
    </div>

    <template v-if="isJapan">
      <lp-customer v-if="isCustomer"/>
      <lp-admin v-else-if="isAdmin"/>
      <lp v-else="isAdmin"/>

    </template>
    <template v-else>
      <home />
    </template>
  </div>
</template>

<script>

import Lp from "~/app/home/Lp";
import LpAdmin from "~/app/home/LpAdmin";
import LpCustomer from "~/app/home/LpCustomer";
import home from "~/app/home/home";

export default {
  name: "HomePage",
  head() {
    return {
      title: [
        this.defaultTitle, "Top"
      ].join(" / ")
    };
  },

  components: {
    Lp,
    LpAdmin,
    LpCustomer,
    home,
  },
};
</script>
