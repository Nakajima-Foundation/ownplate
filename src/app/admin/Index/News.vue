<template>
  <div
    v-if="isJapan"
    class="mx-6 mt-4 rounded-lg border-2 border-solid border-black/10 px-4 py-2"
  >
    <div class="flex">
      <div class="flex-1">
        <span class="text-sm font-bold text-black/40">{{
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

<script lang="ts">
import { defineComponent } from "vue";
import newsList from "@/app/admin/News/data";
import { isJapan } from "@/utils/utils";

export default defineComponent({
  setup() {
    return {
      news: newsList[0],
      isJapan,
    };
  },
});
</script>
