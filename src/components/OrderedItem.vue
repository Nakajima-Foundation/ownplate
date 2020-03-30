<template>
  <div>{{ item.title }}</div>
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