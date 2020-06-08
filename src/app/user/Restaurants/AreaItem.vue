<template>
  <!-- Item Card -->
  <div class="column is-one-third">
    <div class="h-full p-b-8 p-r-8">
      <nuxt-link :to="'/r/area/' + id">
        <div class="touchable bg-surface r-8 d-low p-l-16 p-r-16 p-t-16 p-b-16 h-full">
          <div class="cols flex-center">
            <!-- Area Name -->
            <div class="flex-1 t-body1 c-text-black-high">{{name}}</div>
            <!-- Restaurant Amount -->
            <div class="t-subtitle2 c-text-black-disabled">{{amount}}</div>
          </div>
        </div>
      </nuxt-link>
    </div>
  </div>
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
