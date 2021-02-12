<template>
  <b-modal :active.sync="isVisible" :width="488">
    <div class="op-dialog p-t-16 p-l-24 p-r-24 p-b-24">
      <!-- Items List -->
      <div class="p-b-8">
        <div
          v-for="(category, index) in categories"
          :key="category"
          class="bg-form cols flex-center r-4 m-t-8"
        >
          <div class="flex-1 p-l-16 p-t-8 p-b-8">
            <span>{{ category }}</span>
          </div>
          <div>
            <b-button
              class="b-reset op-button-text bg-transparent"
              @click="handleDelete(index)"
            >
              <i class="material-icons c-status-red s-18 p-l-8 p-r-8">delete</i>
            </b-button>
          </div>
        </div>
      </div>

      <!-- Add Item -->
      <div class="cols">
        <b-input
          class="flex-1"
          :placeholder="$t('editMenu.newCategory')"
          v-model="newEntry"
        />
        <b-button
          :disabled="!isValidEntry"
          class="b-reset m-l-8 op-button-pill bg-form t-button"
          @click="handleAdd"
        >
          <i class="material-icons c-primary p-l-8">add</i>
          <span class="c-primary">{{ $t("editMenu.newCategoryAdd") }}</span>
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
