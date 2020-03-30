<template>
  <div class="card block">
    <div class="card-content">
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
          {{ order.totalCount }} items
        </div>
        <div class="level-right">
          {{ order.phone }}
        </div>
      </div>
      <div class="level is-mobile" style="margin:0">
        <div class="level-left">
          {{ order.totalPrice }}
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
  }
}
</script>