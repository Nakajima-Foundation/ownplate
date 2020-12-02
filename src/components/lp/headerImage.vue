<template>
  <div>
    <!-- Home Header Area -->
    {{imageFile}}
  </div>
</template>

<script>
export default {
  computed: {
    imageFile() {
      const seed  = Math.floor(Math.random()* 101)
      if (seed == 100) {
        return "ss.jpg";
      }
      const fileSuffix = String(seed%2);
      return  `smile_${fileSuffix}.jpg`;
    }
  }
}
</script>
