<template>
  <div>
    <!-- Header -->
    <div class="mx-auto mt-4 max-w-(--breakpoint-md) px-6">
      <router-link to="/admin/restaurants">
        <div
          class="inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
        >
          <i class="material-icons text-op-teal mr-2 text-lg">home</i>
          <div class="text-op-teal text-sm font-bold">
            {{ $t("button.adminTop") }}
          </div>
        </div>
      </router-link>
    </div>

    <!-- Title -->
    <div
      class="mx-auto mt-2 max-w-(--breakpoint-md) px-6 text-xl font-bold text-black/40"
    >
      {{ $t("admin.news.title") }}
    </div>

    <!-- Articles -->
    <div class="mx-auto mt-2 max-w-(--breakpoint-md) px-6">
      <year-group
        v-for="group in recentGroups"
        :key="group.year"
        :year="group.year"
        :items="group.items"
      />

      <!-- 畳んだ分の入口は折り目に置く。下に付けると、開いたあと閉じに戻れない。 -->
      <button
        v-if="olderGroups.length > 0"
        class="text-op-teal mt-6 inline-flex items-center text-sm font-bold"
        @click="showOlder = !showOlder"
      >
        <i class="material-icons mr-1 text-lg">
          {{ showOlder ? "expand_less" : "expand_more" }}
        </i>
        {{
          $t("admin.news.olderNews", {
            year: olderGroups[0].year,
            count: olderCount,
          })
        }}
      </button>

      <div v-if="showOlder">
        <year-group
          v-for="group in olderGroups"
          :key="group.year"
          :year="group.year"
          :items="group.items"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import YearGroup from "@/app/admin/News/YearGroup.vue";
import newsList from "@/app/admin/News/data";
import { newsByYear } from "@/utils/newsList";
import { defaultTitle } from "@/utils/utils";
import { useHead } from "@unhead/vue";

// 最初から出すのは直近の年だけ。古い回まで並べると、新しい回が流れて見えなくなる。
const RECENT_YEARS_SHOWN = 2;

export default defineComponent({
  components: {
    YearGroup,
  },
  setup() {
    useHead(() => ({
      title: ["News", defaultTitle].join(" / "),
    }));

    const groups = newsByYear(newsList);
    const olderGroups = groups.slice(RECENT_YEARS_SHOWN);

    return {
      recentGroups: groups.slice(0, RECENT_YEARS_SHOWN),
      olderGroups,
      olderCount: olderGroups.reduce(
        (count, group) => count + group.items.length,
        0,
      ),
      showOlder: ref(false),
    };
  },
});
</script>
