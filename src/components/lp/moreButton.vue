<template>
  <div class="columns is-gapless">
    <div class="column is-narrow w-6"></div>
    <!-- Center Column -->
    <div class="column">
      <div class="align-center">
        <b-button
          class="b-reset h-9 rounded-full bg-form"
          tag="nuxt-link"
          to=""
        >
          <span class="p-l-16 p-r-16">
            <span class="c-primary t-button">{{ $t("lp.moreDetails") }}</span>
          </span>
        </b-button>
      </div>
    </div>
    <div class="column is-narrow w-6"></div>
  </div>
</template>
<script>
export default {};
</script>
