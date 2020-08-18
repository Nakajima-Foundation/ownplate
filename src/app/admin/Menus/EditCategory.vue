<template>
  <b-modal :active.sync="isVisible" :width="488">
    <div class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
      <div>Foo</div>
    </div>
  </b-modal>
</template>

<script>
export default {
  data() {
    return {
      isVisible: true
    };
  },
  watch: {
    isVisible(newValue) {
      if (!newValue) {
        this.$emit("dismissed");
      }
    }
  }
};
</script>
