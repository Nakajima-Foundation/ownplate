<template>
  <div class="columns is-gapless">
    <div class="column is-narrow w-6"></div>
    <div class="column">
      <div class="align-center">
        <h2>サービスからのお知らせ</h2>
      </div>
      <div class="columns is-gapless is-multiline">
        <!-- v-for="article in articles" -->
        <li v-for="news in newsList.slice(0, 5)">
          <nuxt-link :to="'/admin/news/' + news.date">
            {{ news.date.replace(/\-/, "年").replace(/\-/, "月") }}日
            {{ news.title }}
          </nuxt-link>
        </li>
      </div>
      <nuxt-link to="/admin/news">もっとみる</nuxt-link>
    </div>
    <div class="column is-narrow w-6"></div>
  </div>
</template>
<script>
import newsList from "../../app/admin/News/data";

export default {
  data() {
    return {
      newsList: newsList
    };
  }
};
</script>
