<template>
  <div class="mt-3 grid grid-cols-3 gap-2 md:grid-cols-5 lg:grid-cols-6">
    <div v-for="(cat, k) in categoryData" :key="k">
      <div class="mb-3 w-full text-sm font-bold text-op-teal">
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
            <img
              src="/apple-touch-icon.png"
              class="bg-white mb-1 w-full rounded-lg shadow"
            />
            <span>{{ cat.name }}</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import category from "./category";
export default category;

</script>
