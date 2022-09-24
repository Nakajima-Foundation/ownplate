<template>
  <b-modal :active.sync="isVisible" :width="488">
    <div class="mx-2 my-6 rounded-lg bg-white p-6 shadow-lg">
      <!-- Items List -->
      <div>
        <div
          v-for="(category, index) in categories"
          :key="category"
          class="mb-2 flex items-center rounded bg-black bg-opacity-5"
        >
          <div class="flex-1 px-4 py-2">
            <span class="text-sm font-bold">{{ category }}</span>
          </div>
          <div>
            <b-button class="b-reset-tw" @click="handleDelete(index)">
              <div class="inline-flex h-9 items-center justify-center px-4">
                <i class="material-icons text-lg text-red-700">delete</i>
              </div>
            </b-button>
          </div>
        </div>
      </div>

      <!-- Add Item -->
      <div class="flex">
        <b-input
          class="mr-2 flex-1"
          :placeholder="$t('editMenu.newCategory')"
          v-model="newEntry"
        />
        <b-button
          :disabled="!isValidEntry"
          class="b-reset-tw"
          @click="handleAdd"
        >
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons mr-2 text-lg text-op-teal">add</i>
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
    shopInfo: {
      type: Object,
      required: true,
    },
    categoryKey: {
      type: String,
      required: true,
    },
  },
  metaInfo() {
    return {
      title: [this.defaultTitle, "Admin Edit Category"].join(" / "),
    };
  },
  data() {
    return {
      isVisible: true,
      newEntry: "",
    };
  },
  created() {
    console.log("***", this.shopInfo);
  },
  watch: {
    isVisible(newValue) {
      if (!newValue) {
        this.$emit("dismissed");
      }
    },
  },
  computed: {
    isValidEntry() {
      if (this.newEntry === "") {
        return false;
      }
      return !this.categories.find((category) => category === this.newEntry);
    },
    categories() {
      return this.shopInfo[this.categoryKey] || [];
    },
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
    },
  },
};
</script>
