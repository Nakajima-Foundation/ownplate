<template>
  <div class="mt-4 grid grid-cols-3 gap-3 md:grid-cols-5 lg:grid-cols-6">
    <div v-for="(cat, k) in categoryData" :key="k">
      <router-link
        :to="
          basePath +
          '/r/' +
          restaurantId() +
          '/category/' +
          cat.id +
          '/' +
          howtoreceive
        "
      >
        <div
          class="mb-2 w-full rounded-lg border-gray-100 bg-white shadow-none"
        >
          <img
            :src="moBaseUrl + '/images/category/' + cat.id + '.jpg'"
            @error="smallImageErrorHandler"
            class="inline-block rounded-lg align-middle"
          />
        </div>
        <div class="mb-2 w-full text-xs font-bold leading-tight text-op-teal">
          {{ cat.name }}
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import category from "./category";
export default category("CategoryTop");
</script>
