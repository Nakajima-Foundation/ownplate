<template>
  <div>
    <template v-if="news === undefined">
      <not-found />
    </template>
    <template v-else>
      <!-- Header -->
      <div class="mx-6 mt-6 flex items-center space-x-4">
        <router-link :to="'/admin/restaurants'">
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons mr-2 text-lg text-op-teal">home</i>
            <div class="text-sm font-bold text-op-teal">
              {{ $t("button.adminTop") }}
            </div>
          </div>
        </router-link>

        <router-link :to="'/admin/news'">
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons mr-2 text-lg text-op-teal">list</i>
            <div class="text-sm font-bold text-op-teal">
              {{ $t("admin.news.newsTop") }}
            </div>
          </div>
        </router-link>
      </div>

      <!-- Body -->
      <div class="mx-auto mt-6 max-w-screen-md px-6 text-base">
        <div class="text-xl font-bold text-black text-opacity-30">
          {{ news.title }}
        </div>

        <div class="mt-2 text-base font-bold text-black text-opacity-30">
          {{ news.date.replace(/\-/g, ".") }}
        </div>

        <div
          class="article-list mt-6 text-base font-bold text-black text-opacity-30"
          v-html="md.render(news.markdown)"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MarkdownIt from "markdown-it";
import newsList from "@/app/admin/News/data";
import NotFound from "@/components/NotFound.vue";
import { useRoute } from "vue-router";

export default defineComponent({
  components: {
    NotFound,
  },
  metaInfo() {
    return {
      title: [(this.news || {}).title, this.defaultTitle].join(" / "),
    };
  },
  setup() {
    const route = useRoute();
    const newsId = route.params.newsId;
    const news = newsList.find((element) => element.date === newsId);
    return {
      md: new MarkdownIt(),
      news,
    };
  },
});
</script>

<style lang="css" scoped>
::v-deep(.article-list) ul {
  list-style: none;
  margin-top: 8px;
  margin-bottom: 12px;
}

::v-deep(.article-list) > ul > li ul li {
  list-style: outside;
  margin-left: 36px;
  margin-bottom: 4px;
  font-weight: normal;
  color: #333333;
}

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
