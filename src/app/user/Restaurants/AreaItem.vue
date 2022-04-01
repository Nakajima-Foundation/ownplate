<template>
  <router-link :to="'/r/area/' + id">
    <div class="bg-white shadow rounded-lg p-4 flex">
      <div class="text-base text-black">{{ name }}</div>
      <div class="flex-1 text-right text-sm text-black text-opacity-40">
        {{ amount }}
      </div>
    </div>
  </router-link>
</template>

<script>
export default {
  props: {
    name: String,
    amount: String,
    id: String
  }
};
</script>
