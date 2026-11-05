<template>
  <div class="mt-4">
    <div class="text-sm font-bold text-black/30">
      {{ $t("admin.news.year", { year }) }}
    </div>
    <div class="mt-2 space-y-2">
      <list-item
        v-for="news in items"
        :key="news.date"
        :date="news.date.replace(/\-/g, '.')"
        :title="news.title"
        :summary="news.summary"
        :version="news.version"
        :id="news.date"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import ListItem from "@/app/admin/News/ListItem.vue";
import type { NewsEntry } from "@/utils/newsList";

export default defineComponent({
  components: {
    ListItem,
  },
  props: {
    year: {
      type: String,
      required: true,
    },
    items: {
      type: Array as PropType<NewsEntry[]>,
      required: true,
    },
  },
});
</script>
