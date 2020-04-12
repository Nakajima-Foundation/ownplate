<template>
  <div class="card block">
    <div class="card-content">
      <div class="media">
        <div class="media-content">
          <h3>{{ menu.itemName }}</h3>
          <p>x {{ item.count }}</p>
          <p>{{ item.option }}</p>
        </div>
        <div class="media-right">
          <figure class="image thumbnail">
            <img class="is-square" :src="menu.itemPhoto" alt style="border-radius: 4px;" />
          </figure>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    menu() {
      return this.item.menu;
    }
  },
  mounted() {
    console.log(this.item.menu);
  }
};
</script>

<style scoped>
.image.thumbnail {
  height: 6em !important;
  width: 6em !important;
  margin-top: -0.8rem;
  margin-right: -0.8rem;
}
</style>
