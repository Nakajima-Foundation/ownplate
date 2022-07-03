<template>
  <div>
    <template v-if="news === undefined">
      <not-found />
    </template>
    <template v-else>
      <!-- Header -->
      <div class="mt-6 mx-6 flex items-center space-x-4">
        <router-link :to="'/admin/restaurants'">
          <div
            class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-op-teal mr-2">home</i>
            <div class="text-sm font-bold text-op-teal">
              {{ $t("admin.news.adminTop") }}
            </div>
          </div>
        </router-link>

        <router-link :to="'/admin/news'">
          <div
            class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-op-teal mr-2">list</i>
            <div class="text-sm font-bold text-op-teal">
              {{ $t("admin.news.newsTop") }}
            </div>
          </div>
        </router-link>
      </div>

      <!-- Body -->
      <div class="text-base mx-auto max-w-screen-md px-6 mt-6">
        <div class="text-xl font-bold text-black text-opacity-30">
          {{ news.title }}
        </div>

        <div class="text-base font-bold text-black text-opacity-30 mt-2">
          {{ news.date.replace(/\-/g, ".") }}
        </div>

        <div class="article-list mt-6" v-html="md.render(news.markdown)" />
      </div>
    </template>
  </div>
</template>

<script>
import MarkdownIt from "markdown-it";
import newsList from "./data";
import NotFound from "@/components/NotFound";

export default {
  components: {
    NotFound,
  },
  metaInfo() {
    return {
      title: [(this.news || {}).title, this.defaultTitle].join(" / "),
    };
  },
  data() {
    const newsId = this.$route.params.newsId;
    const news = newsList.find((element) => element.date === newsId);
    return {
      md: new MarkdownIt(),
      news,
    };
  },
};
</script>

<style lang="scss" scoped>
/*
/deep/ .article-list h2 {
  @apply text-xl font-bold text-black text-opacity-30 mb-8;
}

/deep/ .article-list ul {
  @apply list-outside list-disc pl-6;
}

/deep/ .article-list > ul {
  @apply list-none p-0;
}

/deep/ .article-list > ul > li {
  @apply text-xl font-bold text-black text-opacity-30;
}

/deep/ .article-list > ul > li:not(:first-child) {
  @apply list-none pt-6;
}

/deep/ .article-list > ul > li ul li {
  @apply text-base font-normal text-black mt-4;
}
  */
</style>
