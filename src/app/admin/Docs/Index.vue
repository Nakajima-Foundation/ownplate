<template>
  <div>
    <!-- Header -->
    <div class="mx-6 mt-4 lg:flex lg:items-center">
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
      <div class="mt-4 text-sm font-bold">
        説明書一覧
        <span class="text-xs font-normal">(別タブでPDFファイルが開きます)</span>
      </div>
      <!-- Manual -->
      <div class="mt-2 rounded-lg bg-black/5 p-4 font-bold">
        <div class="">
          <a
            href="https://docs.omochikaeri.com/manuals/manual.pdf"
            target="_blank"
            class="text-op-teal inline-flex items-center justify-center text-sm font-bold"
          >
            {{ $t("menu.manualLink") }}
          </a>
          <span class="text-xs font-normal"
            >おもちかえり.comの導入から基本的な設定/使い方の説明書です</span
          >
        </div>

        <!-- Delivery Manual -->
        <div class="">
          <a
            href="https://docs.omochikaeri.com/manuals/delivery.pdf"
            target="_blank"
            class="text-op-teal inline-flex items-center justify-center text-sm font-bold"
          >
            {{ $t("menu.deliveryManualLink") }}
          </a>
          <span class="text-xs font-normal"
            >自社配達のデリバリー機能の説明書です</span
          >
        </div>

        <!-- Printer Manual -->
        <div class="">
          <a
            href="https://docs.omochikaeri.com/manuals/printer.pdf"
            target="_blank"
            class="text-op-teal inline-flex items-center justify-center text-sm font-bold"
          >
            {{ $t("menu.printerManualLink") }}
          </a>
          <span class="text-xs font-normal"
            >スター精密製のキッチンプリンターで印刷する機能の説明書です</span
          >
        </div>

        <!-- Smaregi -->
        <div class="">
          <a
            href="https://docs.omochikaeri.com/manuals/smaregi.pdf"
            target="_blank"
            class="text-op-teal inline-flex items-center justify-center text-sm font-bold"
          >
            {{ $t("admin.thirdPartyService.smaregiManual") }}
          </a>
          <span class="text-xs font-normal"
            >スマレジと連携機能の説明書です</span
          >
        </div>
        <!-- Tips -->
        <div class="">
          <a
            href="https://docs.omochikaeri.com/manuals/tips.pdf"
            target="_blank"
            class="text-op-teal inline-flex items-center justify-center text-sm font-bold"
          >
            {{ $t("menu.tipsLink") }}
          </a>
          <span class="text-xs font-normal"
            >テイクアウト運営に役立つ情報をまとめています</span
          >
        </div>
      </div>

      <!-- Features -->
      <div class="mt-4 text-sm font-bold">機能紹介</div>

      <div class="mt-2 rounded-lg bg-black/5 p-4 font-bold">
        <div>
          <router-link
            to="/admin/docs/features/"
            class="text-op-teal inline-flex items-center justify-center text-sm font-bold"
            >機能一覧</router-link
          >
        </div>
        <div>
          <router-link
            to="/admin/docs/articles/article230930_line_official_account/"
            class="text-op-teal inline-flex items-center justify-center text-sm font-bold"
            >おもちかえり.comと飲食店様LINE公式アカウントの連携方法</router-link
          >
          <span class="text-xs opacity-50">(2023/09/30)</span>
        </div>
        <div>
          <router-link
            to="/admin/docs/articles/article231019_lunch_n_dinner/"
            class="text-op-teal inline-flex items-center justify-center text-sm font-bold"
            >ランチ/ディナー切り替え</router-link
          >
          <span class="text-xs opacity-50">(2023/10/19)</span>
        </div>
        <div>
          <router-link
            to="/admin/docs/articles/article231007_out_of_stock/"
            class="text-op-teal inline-flex items-center justify-center text-sm font-bold"
            >売り切れ/本日売り切れについて</router-link
          >
          <span class="text-xs opacity-50">(2023/10/07)</span>
        </div>
        <div>
          <router-link
            to="/admin/docs/articles/article240725_lead_time_management/"
            class="text-op-teal inline-flex items-center justify-center text-sm font-bold"
            >営業時間、受け渡し準備時間等の設定ガイド：お弁当から給食まで、多様なビジネスモデルに対応</router-link
          >
          <span class="text-xs opacity-50">(2024/07/31)</span>
        </div>
        <div>
          <router-link
            to="/admin/docs/articles/article240727_configurations_of_dishes/"
            class="text-op-teal inline-flex items-center justify-center text-sm font-bold"
            >商品設定の活用方法：オプション、ランチ/ディナー切り替え、販売除外日/時間</router-link
          >
          <span class="text-xs opacity-50">(2024/07/31)</span>
        </div>
        <div>
          <router-link
            to="/admin/docs/articles/article240817_stripe_payouts/"
            class="text-op-teal inline-flex items-center justify-center text-sm font-bold"
            >オンライン決済(Stripe)利用時の入金スケジュールの確認と設定方法について</router-link
          >
          <span class="text-xs opacity-50">(2024/08/19)</span>
        </div>
        <div>
          <router-link
            to="/admin/docs/articles/article250315_discounts/"
            class="text-op-teal inline-flex items-center justify-center text-sm font-bold"
            >値引き機能</router-link
          >
          <span class="text-xs opacity-50">(2025/03/15)</span>
        </div>
      </div>

      <div class="mt-4 text-sm font-bold">役立つリンク</div>

      <div class="mt-2 rounded-lg bg-black/5 p-4 font-bold">
        <div>
          <router-link
            to="/admin/news"
            class="text-op-teal inline-flex items-center justify-center text-sm font-bold"
            >更新一覧</router-link
          >

          -
          <span class="text-xs font-normal"
            >おもちかえり.comの更新情報です。機能の追加や変更はこちらを確認してください。</span
          >
        </div>
        <div>
          <a
            href="https://note.com/singsoc/m/m19dd935e84e4"
            target="_blank"
            class="text-op-teal inline-flex items-center justify-center text-sm font-bold"
            >Note
          </a>
          -
          <span class="text-xs font-normal"
            >おもちかえり.comに追加された機能の説明や活用方法、店舗紹介などを不定期紹介しています。</span
          >
        </div>
        <div>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfGR4kk65ynfkCRGJsvJz01HZf7AU1nGLL9Rn9i4G9-qiW6MQ/viewform"
            target="_blank"
            class="text-op-teal inline-flex items-center justify-center text-sm font-bold"
            >お問い合わせ</a
          >
          -
          <span class="text-xs font-normal"
            >おもちかえり.comの利用に関して、不明点や要望などの問い合わせ窓口です。テイクアウト/デリバリー利用時の店舗への質問は各店舗へ直接問い合わせてください</span
          >
        </div>
        <div>
          <router-link
            to="/admin/faq"
            class="text-op-teal inline-flex items-center justify-center text-sm font-bold"
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
