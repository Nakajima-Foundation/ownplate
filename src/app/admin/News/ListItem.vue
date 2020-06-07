<template>
  <!-- Item Card -->
  <div class="column is-one-third">
    <div class="h-full p-b-8 p-r-8">
      <nuxt-link :to="'/admin/news/' + id">
        <div class="touchable bg-surface r-8 d-low p-l-16 p-r-16 p-t-8 p-b-8 h-full">
          <!-- Date -->
          <div class="t-subtitle2 c-text-black-disabled">{{date}}</div>

          <!-- Title -->
          <div class="t-body1 c-text-black-high">{{title}}</div>
        </div>
      </nuxt-link>
    </div>
  </div>
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
