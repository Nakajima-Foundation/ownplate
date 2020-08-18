<template>
  <b-modal :active.sync="isVisible" :width="488">
    <div class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
      <div>Foo</div>
      <b-input placeholder="New Category" v-model="newEntry" />
      <b-button @click="handleAdd">
        <i class="material-icons">add</i>
      </b-button>
    </div>
  </b-modal>
</template>

<script>
export default {
  props: {
    restaurantInfo: {
      type: Object,
      required: true
    },
    categoryKey: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isVisible: true,
      newEntry: ""
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
  },
  computed: {
    categories() {
      return this.restaurantInfo[this.categoryKey] || [];
    }
  },
  methods: {
    handleAdd() {
      console.log("***", this.newEntry);
      const categories = this.categories;
      categories.push(this.newEntry);
      this.$emit("updated", categories);
      this.newEntry = "";
    }
  }
};
</script>
