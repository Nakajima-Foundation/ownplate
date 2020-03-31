<template>
  <div class="card block">
    <div class="card-content" @click="$emit('selected', order)">
      <div class="level is-mobile" style="margin:0">
        <div class="level-left">
          <h3>foo</h3>
        </div>
        <div class="level-right">
          bar
        </div>
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
  },
  mounted() {
  }
}
</script>