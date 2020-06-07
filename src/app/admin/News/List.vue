<template>
  <div>
    <!-- List Header Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24 m-t-24">
          <!-- Link Button -->
          <nuxt-link :to="'/admin/restaurants'">
            <div class="op-button-pill bg-form">
              <i class="material-icons c-primary s-18">home</i>
              <span class="c-primary t-button">{{$t("admin.news.adminTop")}}</span>
            </div>
          </nuxt-link>

          <!-- Title -->
          <div class="t-h6 c-text-black-disabled m-t-24">{{$t("admin.news.title")}}</div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>

    <!-- List Body Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-16 m-t-16">
          <!-- Articles -->
          <div class="columns is-gapless is-multiline">
            <!-- v-for="article in articles" -->

            <list-item :date="'2020.06.04'" :title="'v0.5.1をリリースしました。'" :id="'undefined'" />
            <list-item :date="'2020.05.28'" :title="'v0.4.2をリリースしました。'" :id="'20200528'" />
            <list-item :date="'2020.05.23'" :title="'v0.4.0をリリースしました。'" :id="'20200523'" />
            <list-item :date="'2020.05.14'" :title="'v0.3.5をリリースしました。'" :id="'20200514'" />
            <list-item :date="'2020.05.11'" :title="'v0.3.4をリリースしました。'" :id="'20200511'" />
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>
  </div>
</template>

<script>
import ListItem from "~/app/admin/News/ListItem";

export default {
  components: {
    ListItem
  }
};
</script>
