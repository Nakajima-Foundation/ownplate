<template>
  <div>
    <template v-if="newsList === undefined">
      <not-found />
    </template>
    <template v-else>
      <!-- Header -->
      <div class="mt-6 mx-6 flex items-center space-x-4">
        <router-link :to="'/'">
          <div
            class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-op-teal mr-2">arrow_back</i>
            <div class="text-sm font-bold text-op-teal">
              {{ $t("button.back") }}
            </div>
          </div>
        </router-link>
      </div>

      <!-- Body -->
      <div class="text-base mx-auto max-w-screen-md px-6 mt-6">
        <div class="mt-6" v-for="(news, key) in newsList" :key="key">
          <div class="bg-white shadow rounded-lg p-4">
            <div class="mt-2">
              <div
                class="article-list mt-6"
                v-html="md.render(news.markdown)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import MarkdownIt from "markdown-it";
import newsList from "../admin/News/data";

export default {
  metaInfo() {
    return {
      title: ["News", this.defaultTitle].join(" / "),
    };
  },
  data() {
    console.log(newsList);
    return {
      md: new MarkdownIt(),
      newsList,
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
