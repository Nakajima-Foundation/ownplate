<template>
  <div class="card block">
    <div class="card-content">
      <div style="margin:0">
        <h3>{{ menu.itemName }}</h3>
        <p>x {{ item.count }}</p>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  components: {
  },
  props: {
    item: {
      type: Object,
      required: true
    },
  },
  computed: {
    menu() {
      return this.item.menu;
    }
  },
  mounted() {
    console.log(this.item.menu)
  }
}
</script>