<template>
  <b-modal :active.sync="isVisible" :width="488">
    <div class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
      <div>Foo</div>
    </div>
  </b-modal>
</template>

<script>
export default {
  props: {
    restaurantInfo: {
      type: Object
    }
  },
  data() {
    return {
      isVisible: true
    };
  },
  created() {
    console.log("***", this.restaurantInfo);
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
