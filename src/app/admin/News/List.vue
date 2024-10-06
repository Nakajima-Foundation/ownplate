<template>
  <div>
    <!-- Header -->
    <div class="mx-6 mt-4">
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
    </div>

    <!-- Title -->
    <div class="mx-6 mt-2 text-xl font-bold text-black text-opacity-40">
      {{ $t("admin.news.title") }}
    </div>

    <!-- Articles -->
    <div
      class="mx-6 mt-2 grid grid-cols-1 items-center gap-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <list-item
        v-for="news in newsList"
        :date="news.date.replace(/\-/g, '.')"
        :title="news.title"
        :id="news.date"
        :key="news.date"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ListItem from "@/app/admin/News/ListItem.vue";
import newsList from "@/app/admin/News/data";
import { defaultTitle } from "@/utils/utils";
import { useHead } from "@unhead/vue";

export default defineComponent({
  components: {
    ListItem,
  },
  setup() {
    useHead({
      title: ["News", defaultTitle].join(" / "),
    });

    return {
      newsList,
    };
  },
});
</script>
