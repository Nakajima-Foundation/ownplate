<template>
  <div>
    <section class="section" style="margin-top:5rem;margin-bottom:5rem">
      <div class="card block">
        <div class="card-content">
          <p style="text-align:center; font-weight:bold; font-size:1.5em">
            <router-link to="/admin/restaurants">{{$t("menu.admins")}}</router-link>
          </p>
        </div>
      </div>
      <div class="card block" v-if="!hideUsersLink">
        <div class="card-content m-t-8">
          <p style="text-align:center; font-weight:bold; font-size:1.5em">
            <router-link to="/r">{{$t("menu.users")}}</router-link>
          </p>
        </div>
      </div>
      <div class="card block">
        <div class="card-content m-t-8">
          <p style="text-align:center; font-weight:bold; font-size:1.5em">
            <router-link to="/about">{{$t("menu.about")}}</router-link>
          </p>
        </div>
      </div>
      <div v-if="$store.getters.isSuperAdmin" class="card block">
        <div class="card-content m-t-8">
          <p style="text-align:center; font-weight:bold; font-size:1.5em">
            <router-link to="/s">Admin Page</router-link>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { releaseConfig } from "~/plugins/config.js";

export default {
  name: "HomePage",

  components: {},
  data() {
    return {};
  },

  mounted() {},

  computed: {
    hideUsersLink() {
      return releaseConfig.hideUsersLink;
    }
  },
  methods: {
    sessionClear() {
      alert("クリアしました");
      window.localStorage.clear();
    }
  }

  // APIcall
  // async mounted() {
  //   await this.$axios.$post('/users', { name: 'yoko' })

  //   const users = await this.$axios.$get('/users')
  //   console.log(users) // [{ id: 0, name: 'taro' }, { id: 1, name: 'yoko' }]
  // }
};
</script>

<style lang="scss">
@include mq(spmd) {
  // 引数を個別に指定
  .second_section {
    .column {
      text-align: center !important;
    }
  }
}

.second_section {
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero {
  .title {
    color: rgb(255, 255, 255) !important;
    .under_line {
      background: linear-gradient(transparent 70%, #ffe600 40%);
    }
  }
}
</style>
