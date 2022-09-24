<template>
  <div class="columns is-gapless">
    <div class="column is-narrow w-6"></div>
    <!-- Center Column -->
    <div class="column">
      <div class="text-center">
        <b-button
          class="b-reset-tw h-9 rounded-full bg-black bg-opacity-5"
          tag="router-link"
          to=""
        >
          <span class="pl-4 pr-4">
            <span class="font-bold text-op-teal">{{
              $t("lp.moreDetails")
            }}</span>
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
