<template>
  <div>
    <!-- Header -->
    <div class="mx-6 mt-6 lg:flex lg:items-center">
      <!-- Back and Preview -->
      <div class="flex space-x-4" v-if="store.getters.isAdmin">
        <back-button url="/admin/restaurants" />
      </div>
      <div class="flex space-x-4" v-else>
        <back-button url="/" backText="button.backToTop" />
      </div>
    </div>

    <!-- PDF -->

    <div class="mx-6">
      <div class="mt-6 text-sm font-bold">
        説明書一覧
        <span class="font-normal text-xs">(別タブでPDFファイルが開きます)</span>
      </div>
      <!-- Manual -->
      <div class="mt-2 rounded-lg bg-black bg-opacity-5 p-4 font-bold">
        <div class="">
          <a
            href="https://docs.omochikaeri.com/manuals/manual.pdf"
            target="_blank"
            class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
          >
            {{ $t("menu.manualLink") }}
          </a>
          <span class="font-normal text-xs"
            >おもちかえり.comの導入から基本的な設定/使い方の説明書です</span
          >
        </div>

        <!-- Delivery Manual -->
        <div class="">
          <a
            href="https://docs.omochikaeri.com/manuals/delivery.pdf"
            target="_blank"
            class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
          >
            {{ $t("menu.deliveryManualLink") }}
          </a>
          <span class="font-normal text-xs"
            >自社配達のデリバリー機能の説明書です</span
          >
        </div>

        <!-- Printer Manual -->
        <div class="">
          <a
            href="https://docs.omochikaeri.com/manuals/printer.pdf"
            target="_blank"
            class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
          >
            {{ $t("menu.printerManualLink") }}
          </a>
          <span class="font-normal text-xs"
            >スター精密製のキッチンプリンターで印刷する機能の説明書です</span
          >
        </div>

        <!-- Smaregi -->
        <div class="">
          <a
            href="https://docs.omochikaeri.com/manuals/smaregi.pdf"
            target="_blank"
            class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
          >
            {{ $t("admin.thirdPartyService.smaregiManual") }}
          </a>
          <span class="font-normal text-xs"
            >スマレジと連携機能の説明書です</span
          >
        </div>
        <!-- Tips -->
        <div class="">
          <a
            href="https://docs.omochikaeri.com/manuals/tips.pdf"
            target="_blank"
            class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
          >
            {{ $t("menu.tipsLink") }}
          </a>
          <span class="font-normal text-xs"
            >テイクアウト運営に役立つ情報をまとめています</span
          >
        </div>
      </div>

      <div class="mt-6 text-sm font-bold">役立つリンク</div>

      <div class="mt-2 rounded-lg bg-black bg-opacity-5 p-4 font-bold">
        <div>
          <router-link
            to="/admin/news"
            class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
            >更新一覧</router-link
          >

          -
          <span class="font-normal text-xs"
            >おもちかえり.comの更新情報です。機能の追加や変更はこちらを確認してください。</span
          >
        </div>
        <div>
          <a
            href="https://note.com/singsoc/m/m19dd935e84e4"
            target="_blank"
            class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
            >Note
          </a>
          -
          <span class="font-normal text-xs"
            >おもちかえり.comに追加された機能の説明や活用方法、店舗紹介などを不定期紹介しています。</span
          >
        </div>
        <div>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfGR4kk65ynfkCRGJsvJz01HZf7AU1nGLL9Rn9i4G9-qiW6MQ/viewform"
            target="_blank"
            class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
            >お問い合わせ</a
          >
          -
          <span class="font-normal text-xs"
            >おもちかえり.comの利用に関して、不明点や要望などの問い合わせ窓口です。テイクアウト/デリバリー利用時の店舗への質問は各店舗へ直接問い合わせてください</span
          >
        </div>
        <div>
          <router-link
            to="/admin/faq"
            class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
            >よくある質問と答え</router-link
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BackButton from "@/components/BackButton.vue";

import { useStore } from "vuex";

export default defineComponent({
  components: {
    BackButton,
  },
  setup() {
    const store = useStore();

    return {
      store,
    };
  },
});
</script>
