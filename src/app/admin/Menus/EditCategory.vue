<template>
  <b-modal :active.sync="isVisible" :width="488">
    <div class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
      <div style="height:16em;overflow-y:scroll;border:1px #ccc solid;border-radius:4px">
        <div class="p-l-4 p-r-4" v-for="(category, index) in categories" :key="category">
          <span style="position:relative; top:10px">{{ category }}</span>
          <b-button class="b-reset h-36 m-l-8" @click="handleDelete(index)">
            <i class="material-icons c-status-red s-18 p-l-8 p-r-8">delete</i>
          </b-button>
        </div>
      </div>
      <div class="cols m-t-16">
        <b-input class="flex-1" placeholder="New Category" v-model="newEntry" />
        <b-button
          :disabled="!isValidEntry"
          class="b-reset m-l-8 op-button-pill h-36 bg-form"
          @click="handleAdd"
        >
          <i class="material-icons c-primary">add</i>
        </b-button>
      </div>
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
    isValidEntry() {
      if (this.newEntry === "") {
        return false;
      }
      return !this.categories.find(category => category === this.newEntry);
    },
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
