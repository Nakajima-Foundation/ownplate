<template>
  <div>
    <div
      class="article-list mt-6 text-base font-bold text-black text-opacity-30"
      v-html="md.render(article)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MarkdownIt from "markdown-it";

import { useRoute } from "vue-router";

import news from "../../../../docs/NEWS.md";
import linenews from "../../../../docs/article230930_line_official_account/line_official_account.md";

const articles: { [key: string]: string } = {
  news,
  line202309: linenews,
};

export default defineComponent({
  setup() {
    const route = useRoute();
    const articleId = route.params.articleId as string;
    const article = articles[articleId];

    return {
      md: new MarkdownIt(),
      article,
    };
  },
});
</script>
