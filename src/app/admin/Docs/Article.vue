<template>
  <div v-if="notFound">
    Not Found
  </div>
  <div v-else>
    <div class="m-6">
      <div
      class="article-list mt-6 text-base font-bold text-black text-opacity-30"
      v-html="md.render(article)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MarkdownIt from "markdown-it";

import { useRoute } from "vue-router";

import linenews from "../../../../docs/article230930_line_official_account/line_official_account.md";
import soldout from "../../../../docs/article231007_out_of_stock/out_of_stock.md";

const articles: { [key: string]: string } = {
  article230930_line_official_account: linenews,
  article231007_out_of_stock: soldout,
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
  @apply my-4 text-base font-bold text-black text-opacity-60;
}
::v-deep(h2) {
  @apply my-4 text-base font-bold text-black text-opacity-60;
}
::v-deep(h3) {
  @apply my-4 text-base font-bold text-black text-opacity-60;
}
::v-deep(h4) {
  @apply my-4 text-base font-bold text-black text-opacity-60;
}
::v-deep(p) {
  @apply my-2 text-base font-bold text-black text-opacity-60;
}
::v-deep(ul) {
  @apply my-2 text-base font-bold text-black text-opacity-60;
}
::v-deep(ol) {
  @apply my-2 text-base font-bold text-black text-opacity-60;
}

::v-deep(table) {
  @apply my-2 text-base font-bold text-black text-opacity-60;
}
</style>
