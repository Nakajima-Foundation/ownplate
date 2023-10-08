<template>
  <div v-if="notFound">
    Not Found
  </div>
  <div v-else>
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
  article230930_line_official_account: linenews,
};

export default defineComponent({
  setup() {
    const route = useRoute();
    const articleId = route.params.articleId as string;
    const article = articles[articleId];

    const notFound = !article
    
    return {
      md: new MarkdownIt({html: true}),
      article,
      notFound,
    };
  },
});
</script>

<style lang="css" scoped>
::v-deep(h1) {
  @apply m-6 text-base font-bold text-black text-opacity-60;
}
::v-deep(h2) {
  @apply m-6 text-base font-bold text-black text-opacity-60;
}
::v-deep(h3) {
  @apply m-6 text-base font-bold text-black text-opacity-60;
}
::v-deep(h4) {
  @apply m-6 text-base font-bold text-black text-opacity-60;
}
::v-deep(p) {
  @apply mx-6 my-2 text-base font-bold text-black text-opacity-60;
}
::v-deep(ul) {
  @apply mx-6 my-2 text-base font-bold text-black text-opacity-60;
}
</style>
