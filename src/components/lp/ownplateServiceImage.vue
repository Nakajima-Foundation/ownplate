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
            <!-- Feature Hero -->
            <div class="bg-ownplate-yellow r-8 align-center m-t-24">
              <div class="h-8 bg-ownplate-yellow is-invisible-tablet"></div>
              <div>
                <img
                  style="height: 416px;"
                  class="cover is-hidden-mobile"
                  :src="`/${this.featureHeroTablet}`"
                />
                <img
                  style="height: 752px;"
                  class="cover is-hidden-tablet"
                  :src="`/${this.featureHeroMobile}`"
                />
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
}
</script>
