<template>
  <div>
    <!-- Demo -->
    <div
      class="mt-8 text-center text-2xl font-bold text-black opacity-40 lg:text-3xl"
    >
      {{ $t("lp.demoVideo") }}
    </div>

    <!-- Demo Videos -->
    <div class="mx-6 mt-6 rounded-2xl bg-white p-6 lg:flex lg:space-x-6">
      <div class="mt-4 text-center lg:mt-0 lg:flex-shrink-0">
        <div>
          <iframe
            width="300"
            height="145"
            src="https://www.youtube.com/embed/lt3iVMj2vfI"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            class="inline-block w-64 cursor-pointer rounded-lg"
          ></iframe>
        </div>
        <div class="mt-2 inline-flex items-center">
          <span class="ml-1 text-base font-bold text-op-teal">{{
            $t("lp.orderFlow")
          }}</span>
        </div>
      </div>
      <div class="mt-4 text-center lg:mt-0 lg:flex-shrink-0">
        <div>
          <iframe
            width="300"
            height="145"
            src="https://www.youtube.com/embed/B2nMqFC0ssA"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            class="inline-block w-64 cursor-pointer rounded-lg"
          ></iframe>
        </div>
        <div class="mt-2 inline-flex items-center">
          <span class="ml-1 text-base font-bold text-op-teal">{{
            $t("lp.flyerCreation")
          }}</span>
        </div>
      </div>
      <div class="mt-4 text-center lg:mt-0 lg:flex-shrink-0">
        <div>
          <iframe
            width="300"
            height="145"
            src="https://www.youtube.com/embed/ATvzuL8nJlk"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            class="inline-block w-64 cursor-pointer rounded-lg"
          ></iframe>
        </div>
        <div class="mt-2 inline-flex items-center">
          <span class="ml-1 text-base font-bold text-op-teal">{{
            $t("lp.cardPayment")
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>
<style scoped>
.highlight {
  background: linear-gradient(transparent 50%, #f6ff5f 50%);
  font-weight: bold;
}
</style>
