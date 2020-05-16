<template>
  <div>
    <!-- Restaurant Profile Photo -->
    <div class="m-t-24 align-center" v-if="src">
      <img :src="src" class="h-64 r-64 cover" />
    </div>

    <!-- Restaurant Name -->
    <div class="m-t-8 align-center t-h6 c-text-black-high">{{ name }}</div>
  </div>
</template>

<script>
export default {
  props: {
    src: {
      type: String
    },
    name: {
      type: String,
      required: true
    }
  }
};
</script>
