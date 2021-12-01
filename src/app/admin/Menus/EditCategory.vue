<template>
  <b-modal v-model:active="isVisible" :width="488">
    <div class="mx-2 my-6 p-6 bg-white shadow-lg rounded-lg">
      <!-- Items List -->
      <div>
        <div
          v-for="(category, index) in categories"
          :key="category"
          class="flex items-center bg-black bg-opacity-5 rounded mb-2"
        >
          <div class="flex-1 px-4 py-2">
            <span class="text-sm font-bold">{{ category }}</span>
          </div>
          <div>
            <b-button class="b-reset-tw" @click="handleDelete(index)">
              <div class="inline-flex justify-center items-center h-9 px-4">
                <i class="material-icons text-lg text-red-700">delete</i>
              </div>
            </b-button>
          </div>
        </div>
      </div>

      <!-- Add Item -->
      <div class="flex">
        <b-input
          class="flex-1 mr-2"
          :placeholder="$t('editMenu.newCategory')"
          v-model="newEntry"
        />
        <b-button
          :disabled="!isValidEntry"
          class="b-reset-tw"
          @click="handleAdd"
        >
          <div
            class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
          >
            <i class="material-icons text-lg text-op-teal mr-2">add</i>
            <div class="text-sm font-bold text-op-teal">
              {{ $t("editMenu.newCategoryAdd") }}
            </div>
          </div>
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
  head() {
    return {
      title: [this.defaultTitle, "Admin Edit Category"].join(" / ")
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
