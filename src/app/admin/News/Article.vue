<template>
  <div>
    <!-- Article Header Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24 m-t-24">
          <!-- Back to Admin Top -->
          <nuxt-link :to="'/admin/restaurants'">
            <div class="op-button-pill bg-form m-r-16">
              <i class="material-icons c-primary s-18">home</i>
              <span class="c-primary t-button">{{$t("admin.news.adminTop")}}</span>
            </div>
          </nuxt-link>

          <!-- Back to News Top -->
          <nuxt-link :to="'/admin/news'">
            <div class="op-button-pill bg-form">
              <i class="material-icons c-primary s-18">list</i>
              <span class="c-primary t-button">{{$t("admin.news.newsTop")}}</span>
            </div>
          </nuxt-link>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>

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
                <div class="t-h6 c-text-black-disabled">{{news.title}}</div>
                <div class="t-subtitle1 c-text-black-disabled m-t-8">{{news.date.replace(/\-/g,".")}}</div>

                <div class="article-list m-t-24" v-html="md.render(news.markdown)" />

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
import MarkdownIt from "markdown-it";
import newsList from './data';

export default {
  head() {
    return {
      title: [this.news.title, this.defaultTitle].join(" / "),
    };
  },
  data() {
    const newsId = this.$route.params.newsId;
    const news = newsList.find(element => element.date === newsId);
    return {
      md: new MarkdownIt(),
      news,
    };
  }
};
</script>

<style lang="scss" scoped>
/deep/ .article-list ul {
  list-style: outside;
  list-style-type: disc;
  padding-left: 24px;
}

/deep/ .article-list > ul {
  list-style: none;
  padding: 0;
}
/deep/ .article-list > ul > li {
  @extend .t-h6;
  @extend .c-text-black-disabled;
}
/deep/ .article-list > ul > li:not(:first-child) {
  padding-top: 24px;
}

/deep/ .article-list > ul > li ul li {
  @extend .t-body1;
  @extend .c-text-black-high;
  margin-top: 16px;
}
</style>
