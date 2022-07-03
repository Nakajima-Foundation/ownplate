<template>
  <div
    v-if="isJapan"
    class="mx-6 mt-6 border-solid border-black border-opacity-10 border-2 rounded-lg px-4 py-2"
  >
    <div class="flex">
      <div class="flex-1">
        <span class="text-sm font-bold text-black text-opacity-40">{{
          news.date.replace(/\-/g, ".")
        }}</span>
      </div>

      <div>
        <router-link :to="'/admin/news/'">
          <span class="text-sm font-bold">{{ $t("admin.news.newsTop") }}</span>
        </router-link>
      </div>
    </div>

    <div class="mt-2">
      <router-link :to="'/admin/news/' + news.date">
        <span class="text-base font-bold">{{ news.title }}</span>
      </router-link>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";
import newsList from "../News/data";

export default defineComponent({
  setup() {
    return {
      news: newsList[0],
    };
  },
});
</script>
