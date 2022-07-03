<template>
  <div>
    <!-- Restaurant Profile Photo -->
    <div class="text-center">
      <div class="inline-block w-16 h-16 rounded-full bg-black bg-opacity-50">
        <img :src="profileImage" class="w-16 h-16 rounded-full object-cover" />
      </div>
    </div>

    <!-- Restaurant Name -->
    <div class="mt-2 text-center text-xl font-bold">
      {{ shopInfo.restaurantName }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  computed: {
    profileImage() {
      return this.resizedProfileImage(this.shopInfo, "600");
    },
  },
};
</script>
