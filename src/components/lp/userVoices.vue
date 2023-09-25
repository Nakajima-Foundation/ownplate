<template>
  <div>
    <!-- User Voices Title -->
    <div class="mt-16 text-black text-center text-op-90 text-2xl font-bold">
      {{ $t("lp.customerVoice1") }}
      <br />{{ $t("lp.customerVoice2") }}
    </div>

    <!-- User Voices Hero -->
    <div class="mx-6 mt-6 rounded-2xl bg-white p-6 lg:flex lg:space-x-6">
      <!-- User Face -->
      <div class="text-center lg:flex-shrink-0">
        <img src="/LP-UserVoice-Face-1.jpg" class="rounded-full" />
      </div>
      <!-- User Comment -->
      <div>
        <i class="material-icons text-4xl opacity-50">format_quote</i>
        <span class="text-base font-bold opacity-90"
          ><span class="highlight">無料</span>なのに<span class="highlight"
            >売上集計</span
          >や<span class="highlight">リピーター有無</span
          >も確認できる！お客さまにも<span class="highlight"
            >注文しやすくなった</span
          >とよろこばれています。<span class="highlight">お心づけ</span
          >を入力頂けるお客様が多いのもうれしいですね。</span
        >
        <div class="mt-4 text-sm font-bold opacity-50">
          新潟県 『サンドしないサンド＜かつ＞ 板谷様
        </div>
      </div>
      <!-- User Video -->
      <div class="mt-4 text-center lg:mt-0 lg:flex-shrink-0">
        <a
          href="https://www.youtube.com/watch?v=4VUGm2v6B7E"
          target="_blank"
          class="inline-block"
        >
          <div>
            <img
              src="/LP-UserVoice-Video-1.jpg"
              class="w-64 cursor-pointer rounded-lg"
            />
          </div>
          <div class="mt-2 inline-flex items-center">
            <i class="material-icons text-2xl text-op-teal"
              >play_circle_filled</i
            >
            <span class="ml-1 text-base font-bold text-op-teal">{{
              $t("lp.playVideo")
            }}</span>
          </div>
        </a>
      </div>
    </div>

    <!-- User Voices -->
    <div class="mx-6 mt-2 grid grid-cols-1 gap-2 lg:grid-cols-3">
      <div class="rounded-2xl bg-white px-6 pt-2 pb-5">
        <i class="material-icons text-3xl opacity-50">format_quote</i>
        <span class="text-sm opacity-90">
          <span class="highlight">営業時間外</span
          >でもテイクアウト注文が受付られるようになって、お客さまからとてもよろこばれています。お店としても<span
            class="highlight"
            >機会損失がなくなりました</span
          >。夜中に次の日の注文が入っていたのは驚きです。</span
        >
      </div>
      <div class="rounded-2xl bg-white px-6 pt-2 pb-5">
        <i class="material-icons text-3xl opacity-50">format_quote</i>
        <span class="text-sm opacity-90">
          電話注文ではどうしても注文の聞き間違えがあり、お客さんにもご迷惑をかけていたのですが、オンラインになってから<span
            class="highlight"
            >注文の間違いがなくなり</span
          >、安心して調理に専念できます。</span
        >
      </div>
      <div class="rounded-2xl bg-white px-6 pt-2 pb-5">
        <i class="material-icons text-3xl opacity-50">format_quote</i>
        <span class="text-sm opacity-90">
          注文が入った時に<span class="highlight">LINE</span>や<span
            class="highlight"
            >電話</span
          >で知らせてくれるので、見落としがなくなりました！</span
        >
      </div>
      <div class="rounded-2xl bg-white px-6 pt-2 pb-5">
        <i class="material-icons text-3xl opacity-50">format_quote</i>
        <span class="text-sm opacity-90">
          <span class="highlight">オンラインで手軽に決済</span
          >できるようになり、お客さまにも喜ばれています。お店としても<span
            class="highlight"
            >「おつりの用意」が不要</span
          >になりました。</span
        >
      </div>
      <div class="rounded-2xl bg-white px-6 pt-2 pb-5">
        <i class="material-icons text-3xl opacity-50">format_quote</i>
        <span class="text-sm opacity-90">
          お客様の<span class="highlight">購入履歴もエクセルで確認</span
          >できるので常連さん、リピーターさんの<span class="highlight"
            >より的確な把握</span
          >ができるようになりました。</span
        >
      </div>
      <div class="rounded-2xl bg-white px-6 pt-2 pb-5">
        <i class="material-icons text-3xl opacity-50">format_quote</i>
        <span class="text-sm opacity-90">
          毎月の売上がエクセルで確認できて、記帳が楽になりました。<span
            class="highlight"
            >日々の雑務を大幅に効率化</span
          >でき、万年人手不足の当店の大きなサポーターです！</span
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {};
</script>
<style scoped>
.highlight {
  background: linear-gradient(transparent 50%, #f6ff5f 50%);
  font-weight: bold;
}
</style>
