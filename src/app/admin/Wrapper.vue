<template>
  <div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { useHead } from "@unhead/vue";

import {
  ADMIN_SCOPE,
  listenForegroundPush,
  registerServiceWorker,
} from "@/utils/webPush";

export default defineComponent({
  setup() {
    // PWA 化は管理画面に閉じる。注文者が店舗ページを開いたときに「ホーム画面に追加」や
    // standalone 表示が出ると、戻るボタンが消えるだけで利点が無いため。
    useHead({
      link: [{ rel: "manifest", href: "/manifest.webmanifest" }],
      meta: [
        { name: "theme-color", content: "#0097a7" },
        { name: "mobile-web-app-capable", content: "yes" },
        // iOS 16.3 以前は manifest の display を見ないので、この meta が無いと standalone にならない
        { name: "apple-mobile-web-app-capable", content: "yes" },
        {
          name: "apple-mobile-web-app-title",
          content: "おもちかえり.com 管理",
        },
      ],
    });

    onMounted(() => {
      // 注文者側のページには Service Worker を一切置かないよう、ここで初めて登録する
      registerServiceWorker(ADMIN_SCOPE);
      listenForegroundPush();
    });
  },
});
</script>
