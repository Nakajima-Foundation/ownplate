<template>
  <span>
    <section class="hero is-info">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            <span class="under_line">PAGE</span>
          </h1>
        </div>
      </div>
    </section>

    <section class="section" style="background-color:#fffafa">
      <div class="columns is-mobile is-centered">
        PageList
      </div>

      <div class="content">
        <ol type="A">
          <div class="columns is-mobile is-left">
            <p class="p-bold">【Reataurant】</p>
          </div>
          <li><router-link to="/r/1710478afd0304e4974">Menu</router-link></li>
          <li><router-link to="/r/1710478afd0304e4974/order/123456789/">Order</router-link></li>
          <li><router-link to="/r/1710478afd0304e4974/order/123456789/thanks">ThankYou</router-link></li>
          <div class="columns is-mobile is-left">
            <p class="p-bold" style="margin-top:2rem;">【Admin】</p>
          </div>
          <li><router-link to="/admin/restaurants/new">Create a new Reataurant</router-link></li>
          <li><router-link to="/admin/restaurants/">Your Reataurant</router-link></li>
          <li><router-link to="/admin/user/signin">Admin Signin</router-link></li>
          <li><router-link to="/admin/user/signup">Admin Signup</router-link></li>
        </ol>
      </div>
    </section>
  </span>
</template>

<script>
export default {
  name: "HomePage",

  components: {},
  data() {
    return {};
  },

  mounted() {},

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
