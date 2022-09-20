<template>
  <div class="mt-4 grid grid-cols-3 gap-3 md:grid-cols-5 lg:grid-cols-6">
    <div v-for="(cat, k) in categoryData" :key="k">
      <router-link
        :to="
          basePath +
          '/r/' +
          restaurantId() +
          '/cat/' +
          cat.id +
          '/' +
          cat.subCategory
        "
      >
        <div @click="closeCategory">
          <div
            class="mb-2 w-full bg-white border-gray-100 rounded-lg shadow-none"
          >
            <img
              :src="moBaseUrl + '/images/category/' + cat.id + '.jpg'"
              @error="smallImageErrorHandler"
              class="inline-block align-middle rounded-lg"
            />
          </div>
          <div class="mb-2 w-full text-xs leading-tight font-bold text-op-teal">
            {{ cat.name }}
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import category from "./category";
export default category("CategoryTop");
</script>
