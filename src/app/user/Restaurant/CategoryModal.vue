<template>
  <div
    class="grid items-center grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4"
  >
    <div v-for="(cat, k) in categoryData" :key="k">
      <router-link
        :to="
          basePath +
          '/r/' +
          restaurantId() +
          '/cat/' +
          cat.id +
          '/' +
          cat.subcategory
        "
      >
        <div @click="closeCategory">
          <div class="flex items-center">
            <div
              class="mt-2 w-10 h-10 mr-2 bg-white border-gray-100 rounded-lg shadow-none"
            >
              <img src="/apple-touch-icon.png" />
            </div>
            <div
              class="flex-1 mt-2 text-xs leading-tight font-bold text-op-teal"
            >
              {{ cat.name }}
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import category from "./category";
export default category("CategoryModal");
</script>
