<template>
  <b-modal :active.sync="isVisible" :width="488">
    <div class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
      <div>
        <div class="m-t-4" v-for="(category, index) in categories" :key="category">
          {{ category }}
          <b-button
            class="b-reset op-button-pill h-36 bg-status-red-bg m-l-8"
            @click="handleDelete(index)"
          >
            <i class="material-icons c-status-red s-18 p-l-8 p-r-8">delete</i>
          </b-button>
        </div>
      </div>
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
    },
    handleDelete(index) {
      const categories = this.categories;
      categories.splice(index, 1);
      this.$emit("updated", categories);
    }
  }
};
</script>
