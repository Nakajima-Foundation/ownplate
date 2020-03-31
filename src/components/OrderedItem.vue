<template>
  <div class="card block">
    <div class="card-content" @click="$emit('selected', order)">
      <div class="level is-mobile" style="margin:0">
        <div class="level-left">
          <h3>{{ order.title }}</h3>
        </div>
        <div class="level-right">
          Order Placed
        </div>
      </div>
      <div class="level is-mobile" style="margin:0">
        <div class="level-left">
          {{ totalCount }} items
        </div>
        <div class="level-right">
          {{ order.phone }}
        </div>
      </div>
      <div class="level is-mobile" style="margin:0">
        <div class="level-left">
          {{ order.total }}
        </div>
        <div class="level-right">
          {{ order.pickupTime }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    order: {
      type: Object,
      required: true
    },
  },
  computed: {
    totalCount() {
      if (this.order.order) {
        return Object.keys(this.order.order).reduce((count, id)=>{ 
          return count + this.order.order[id]; 
        }, 0);
      }
      return 0;
    }
  },
  mounted() {
    console.log(this.order);
  }
}
</script>