<template>
  <div>
    <!-- Header -->
    <div class="mt-6 mx-6">
      <router-link :to="'/admin/restaurants'">
        <div
          class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
        >
          <i class="material-icons text-lg text-op-teal mr-2">home</i>
          <div class="text-sm font-bold text-op-teal">
            {{ $t("admin.news.adminTop") }}
          </div>
        </div>
      </router-link>
    </div>

    <!-- Title -->
    <div class="text-xl font-bold text-black text-opacity-40 mt-6 mx-6">
      {{ $t("admin.news.title") }}
    </div>

    <!-- Articles -->
    <div
      class="mt-2 mx-6 grid items-center grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4"
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

<script>
import ListItem from "~/app/admin/News/ListItem";
import newsList from "./data";

export default {
  components: {
    ListItem,
  },
  metaInfo() {
    return {
      title: ["News", this.defaultTitle].join(" / "),
    };
  },
  data() {
    return {
      newsList: newsList,
    };
  },
};
</script>
