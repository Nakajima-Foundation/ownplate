<template>
  <div class="card block">
    <div class="card-content">
      <div class="level is-mobile" style="margin:0">
        <div class="level-left">
          <h3>{{ item.title }}</h3>
        </div>
        <div class="level-right">
          Order Placed
        </div>
      </div>
      <div class="level is-mobile" style="margin:0">
        <div class="level-left">
          {{ item.totalCount }} items
        </div>
        <div class="level-right">
          {{ item.phone }}
        </div>
      </div>
      <div class="level is-mobile" style="margin:0">
        <div class="level-left">
          {{ item.totalPrice }}
        </div>
        <div class="level-right">
          {{ item.pickupTime }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true
    },
  }
}
</script>