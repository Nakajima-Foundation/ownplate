<template>
  <!-- Header -->
  <div class="mx-6 mt-4 lg:flex lg:items-center">
    <!-- Back and Preview -->
    <div class="flex space-x-4">
      <back-button url="/admin/docs/" backText="button.backToDocument" />
    </div>
  </div>
  <div class="mx-6">
    <div>
      <div class="mt-2 text-sm font-bold">申し込み方法</div>
      <div class="mt-2 rounded-lg bg-black/5 p-4">
        <div>
          おもちかえり.comのご利用は、メールアドレスがあればオンラインで申し込みし、すぐに利用可能です
        </div>
        <div>
          クレジット決済もオンライン手続後、最短で当日から利用可能(クレジット決済を使わないことも可能です）
        </div>
      </div>
    </div>

    <div>
      <div class="mt-2 text-sm font-bold">主な機能</div>
      <div class="mt-2 rounded-lg bg-black/5 p-4">
        <div>
          <ul class="list-disc pl-4">
            <li>飲食店/飲食店利用者、それぞれWebブラウザのみで利用可能</li>
            <li>店舗登録</li>
            <li>商品登録</li>
            <li>商品メニューにきめ細やかなオプションの設定</li>
            <li>メニューからチラシ作成用のPDFを自動作成</li>
            <li>テイクアウト/デリバリー受付</li>
            <li>デリバリー受付（地図、住所対応、送料計算）</li>
            <li>24時間/365日自動受付</li>
            <li>クレジット決済の事前決済</li>
            <li>店舗のLINE公式アカウントと連携</li>
            <li>スマレジによる在庫連携</li>
            <li>自動値引き</li>
            <li>売上レポート、エクセルダウンロード</li>
            <li>店舗利用者/飲食店への豊富な通知方法</li>
            <li>モバイルプリンター/キッチンプリンターサポート</li>
            <li>複数アカウントのよる管理</li>
          </ul>
        </div>
      </div>
    </div>

    <div>
      <div class="mt-2 text-sm font-bold">制限</div>
      <div class="mt-2 rounded-lg bg-black/5 p-4">
        <div>
          <ul class="list-disc pl-4">
            <li>店舗数 制限なし</li>
            <li>商品数 制限なし</li>
          </ul>
        </div>
      </div>
    </div>

    <div>
      <div class="mt-2 text-sm font-bold">店舗への受注通知方法</div>
      <div class="mt-2 rounded-lg bg-black/5 p-4">
        <div>
          <ul class="list-disc pl-4">
            <li>ブラウザ上で音声</li>
            <li>メール</li>
            <li>LINE</li>
            <li>電話</li>
            <li>キッチンプリンター</li>
          </ul>
        </div>
      </div>
    </div>

    <div>
      <div class="mt-2 text-sm font-bold">飲食店利用者への通知方法</div>
      <div class="mt-2 rounded-lg bg-black/5 p-4">
        <div>
          <ul class="list-disc pl-4">
            <li>おもちかえり.comLINE公式アカウント</li>
            <li>店舗LINE公式アカウント</li>
            <li>SMS(一部の通知で利用)</li>
          </ul>
        </div>
      </div>
    </div>

    <div>
      <div class="mt-2 text-sm font-bold">決済方法</div>
      <div class="mt-2 rounded-lg bg-black/5 p-4">
        <div>
          <ul class="list-disc pl-4">
            <li>現地払い</li>
            <li>オンラインクレジット決済（VISA, Master, Amex, JCB)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BackButton from "@/components/BackButton.vue";
export default defineComponent({
  components: {
    BackButton,
  },
});
</script>
