<template>
  <div class="card block">
    <div class="card-content">
      <h3>{{ item.title }}</h3>
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