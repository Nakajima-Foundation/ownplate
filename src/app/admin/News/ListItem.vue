<template>
  <router-link :to="'/admin/news/' + id">
    <div class="bg-white shadow rounded-lg px-4 py-2">
      <div class="text-sm font-bold text-black text-opacity-30">{{ date }}</div>
      <div class="text-base text-black text-opacity-60">{{ title }}</div>
    </div>
  </router-link>
</template>

<script>
export default {
  props: {
    date: String,
    title: String,
    id: String
  }
};
</script>
