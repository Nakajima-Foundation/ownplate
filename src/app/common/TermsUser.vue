<template>
  <div>
    <!-- Article Body Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="columns is-gaplress">
          <div class="column is-three-fifths is-offset-one-fifth">
            <div class="m-l-24 m-r-24">
              <div class="m-t-24">
                <!-- Title -->
                <div class="t-h6 c-text-black-disabled">{{ $t("menu.termsUser") }}</div>

                <!-- Date -->
                <div
                  class="t-subtitle1 c-text-black-disabled m-t-8"
                >{{ $t("menu.updated") }}: 2020.06.24</div>

                <!-- Body -->
                <div class="article-list m-t-24">BODY</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>
  </div>
</template>

<script>
</script>
