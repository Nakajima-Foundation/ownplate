<template>
  <div>
    <!-- Home Header Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="columns is-gapless">
          <div class="column is-narrow w-24"></div>
          <div class="column">
            <div class="h-24 is-hidden-mobile"></div>
            <!-- Feature Hero -->
            <div class="bg-ownplate-yellow r-8 align-center">
              <div>
                <!-- Faces and Foods -->
                <div>
                  <img
                    src="/LP-Cover-Tablet-1.jpg"
                    class="cover is-hidden-mobile r-8 r-b-0"
                  />

                  <!-- # Need to show 1-1 / 1-2 randomly -->
                  <img :src="coverMobile" class="cover is-hidden-tablet" />
                </div>

                <!-- Tagline -->
                <div
                  class="t-h5 is-size-2-tablet c-ownplate-white p-t-32 p-b-24 "
                  style="font-weight: bold"
                >
                  お店の笑顔もおもちかえり！
                </div>
                <div
                  class="h-4 w-288 bg-ownplate-white"
                  style="display: inline-block"
                ></div>

                <!-- Features -->
                <div>
                  <img
                    style="height: 416px;"
                    class="cover is-hidden-mobile"
                    :src="`/${this.featureHeroTablet}`"
                  />
                </div>
                <div>
                  <img
                    style="height: 752px;"
                    class="cover is-hidden-tablet"
                    :src="`/${this.featureHeroMobile}`"
                  />
                </div>
              </div>
              <div class="h-8 bg-ownplate-yellow is-invisible-tablet"></div>
            </div>
          </div>
          <div class="column is-narrow w-24"></div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
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
    }
  }
};
</script>
