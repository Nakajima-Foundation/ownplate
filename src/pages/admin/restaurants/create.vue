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
  }
};
</script>

<style lang="scss">
.hero {
  .title {
    color: rgb(255, 255, 255) !important;
    .under_line {
      background: linear-gradient(transparent 70%, #ffe600 40%);
    }
  }
}
</style>
