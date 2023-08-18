<template>
  <div
    v-if="isJapan"
    class="mx-6 mt-6 rounded-lg border-2 border-solid border-black border-opacity-10 px-4 py-2"
  >
    <div class="mt-2" >
      <a href="https://forms.gle/Friqmtc4CYGW8YQE7" rel="noopener noreferrer" class="underline">
        <span class="text-base font-bold">3月31日まで、アンケートをお願いしています。みなさんのご意見をお待ちしています。</span>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import newsList from "../News/data";
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
