<template>
  <div>
    <div class="bg-op-yellow">
      <!-- Faces and Foods -->
      <div>
        <img :src="coverMobile" class="w-full lg:hidden" />
        <img
          src="/LP-Cover-Tablet-1.jpg"
          class="hidden lg:inline-block w-full"
        />
      </div>

      <!-- Tagline -->
      <div class="text-white text-center text-2xl font-bold py-8 lg:text-4xl">
        {{ $t("lp.enjoyOmochilaeri") }}
      </div>

      <div class="block h-1 w-72 bg-white m-auto"></div>

      <!-- Features -->
      <div>
        <img
          style="height: 752px"
          class="object-cover lg:hidden"
          :src="`/${this.featureHeroMobile}`"
        />
        <img
          style="height: 416px"
          class="hidden lg:inline-block object-cover"
          :src="`/${this.featureHeroTablet}`"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    coverMobile() {
      const seed = (Math.floor(Math.random() * 2) % 2) + 1;
      console.log(seed);
      return `/LP-Cover-Mobile-1-${seed}.jpg`;
    },
  },
};
</script>
