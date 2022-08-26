<template>
  <div
    class="mt-4 grid items-center grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4"
  >
    <div v-for="(cat, k) in categoryData" :key="k">
      <router-link
        :to="
          '/admin/restaurants/' +
          restaurantId() +
          '/menus/cat/' +
          cat.id +
          '/' +
          cat.subCategory
        "
      >
        <div class="flex items-center">
          <div
            class="mt-2 w-10 h-10 mr-2 bg-white border-gray-100 rounded-lg shadow-none"
          >
            <img src="/apple-touch-icon.png" />
          </div>
          <div class="flex-1 mt-2 text-xs leading-tight font-bold text-op-teal">
            {{ cat.name }}
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  props: {
    categoryData: {
      type: Array,
      required: true,
    },
  },
});
</script>
