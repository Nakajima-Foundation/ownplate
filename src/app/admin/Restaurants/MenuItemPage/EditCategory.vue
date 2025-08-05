<template>
  <t-modal
    v-model:active="isVisible"
    width="488"
    @dismissed="isVisible = false"
  >
    <div class="mx-2 my-6 rounded-lg bg-white p-6 shadow-lg">
      <!-- Items List -->
      <div>
        <div
          v-for="(category, index) in categories"
          :key="category"
          class="mb-2 flex items-center rounded-sm bg-black/5"
        >
          <div class="flex-1 px-4 py-2">
            <span class="text-sm font-bold">{{ category }}</span>
          </div>
          <div>
            <button class="cursor-pointer" @click="handleDelete(index)">
              <div class="inline-flex h-9 items-center justify-center px-4">
                <i class="material-icons text-lg text-red-700">delete</i>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Add Item -->
      <div class="flex">
        <input
          class="mr-2 flex-1 border border-gray-300 rounded px-3 py-2"
          :placeholder="$t('editMenu.newCategory')"
          v-model="newEntry"
        />
        <button
          :disabled="!isValidEntry"
          class="ml-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          @click="handleAdd"
        >
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
          >
            <i class="material-icons text-op-teal mr-2 text-lg">add</i>
            <div class="text-op-teal text-sm font-bold">
              {{ $t("editMenu.newCategoryAdd") }}
            </div>
          </div>
        </button>
      </div>
    </div>
  </t-modal>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from "vue";
import { defaultTitle } from "@/utils/utils";
import { useHead } from "@unhead/vue";

export default defineComponent({
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
  emits: ["dismissed", "updated"],
  setup(props, context) {
    const isVisible = ref(true);
    const newEntry = ref("");

    useHead(() => ({
      title: [defaultTitle, "Admin Edit Category"].join(" / "),
    }));

    watch(isVisible, (newValue) => {
      if (!newValue) {
        context.emit("dismissed");
      }
    });

    const categories = computed(() => {
      return props.shopInfo[props.categoryKey] || [];
    });
    const isValidEntry = computed(() => {
      if (newEntry.value === "") {
        return false;
      }
      return !categories.value.find(
        (category: string) => category === newEntry.value,
      );
    });

    const handleAdd = () => {
      console.log("***", newEntry.value);
      const copyCategories = categories.value.concat();
      copyCategories.push(newEntry.value);
      context.emit("updated", copyCategories);
      newEntry.value = "";
    };
    const handleDelete = (index: number) => {
      const copyCategories = categories.value.concat();
      copyCategories.splice(index, 1);
      context.emit("updated", copyCategories);
    };

    return {
      isVisible,
      newEntry,
      isValidEntry,
      categories,
      handleAdd,
      handleDelete,
    };
  },
});
</script>
