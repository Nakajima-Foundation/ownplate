<template>
  <div>
    <!-- Header -->
    <div class="mx-6 mt-4 flex items-center space-x-4">
      <router-link :to="'/'">
        <div
          class="inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
        >
          <i class="material-icons mr-2 text-lg text-op-teal">arrow_back</i>
          <div class="text-sm font-bold text-op-teal">
            {{ $t("button.back") }}
          </div>
        </div>
      </router-link>
    </div>

    <!-- Body -->
    <div class="mx-auto mt-2 max-w-(--breakpoint-md) px-6 text-base">
      <div class="mt-4" v-for="(news, key) in newsList" :key="key">
        <div class="rounded-lg bg-white p-4 shadow-sm">
          <div class="mt-2">
            <div class="article-list mt-2" v-html="md.render(news.markdown)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import MarkdownIt from "markdown-it";
import newsList from "@/app/admin/News/data";

import { defaultTitle } from "@/utils/utils";
import { useHead } from "@unhead/vue";

export default defineComponent({
  setup() {
    useHead({
      title: ["News", defaultTitle].join(" / "),
    });

    return {
      md: new MarkdownIt(),
      newsList,
    };
  },
});
</script>

<style lang="css" scoped>
::v-deep(.article-list) h2 {
  font-weight: bold;
}
::v-deep(.article-list) ul {
  list-style: none;
  margin-top: 8px;
  margin-bottom: 12px;
  font-weight: bold;
}

::v-deep(.article-list) > ul > li ul li {
  list-style: outside;
  margin-left: 36px;
  margin-bottom: 4px;
  font-weight: normal;
  color: #333333;
}
::v-deep(.article-list) > ul > li ul li a:link {
  color: #1197a7 !important;
}
::v-deep(.article-list) > ul > li ul li a:visited {
  color: #1197a7 !important;
}
::v-deep(.article-list) > ul > li ul li a:hover {
  color: #1197a7 !important;
}
::v-deep(.article-list) > ul > li ul li a:active {
  color: #1197a7 !important;
}

/*
  /deep/ .article-list h2 {
  @apply text-xl font-bold text-black/30 mb-8;
}

/deep/ .article-list ul {
  @apply list-outside list-disc pl-6;
}

/deep/ .article-list > ul {
  @apply list-none p-0;
}

/deep/ .article-list > ul > li {
  @apply text-xl font-bold text-black/30;
}

/deep/ .article-list > ul > li:not(:first-child) {
  @apply list-none pt-6;
}

/deep/ .article-list > ul > li ul li {
  @apply text-base font-normal text-black mt-4;
}
*/
</style>
