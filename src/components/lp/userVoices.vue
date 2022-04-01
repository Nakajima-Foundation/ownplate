<template>
  <div>
    <!-- User Voices Title -->
    <div
      class="text-center mt-8 text-2xl font-bold text-black opacity-40 lg:text-3xl"
    >
      {{ $t("lp.customerVoice1") }}
      <br />{{ $t("lp.customerVoice2") }}
    </div>

    <!-- User Voices Hero -->
    <div class="bg-white mt-6 mx-6 rounded-2xl p-6 lg:flex lg:space-x-6">
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
        <div class="text-sm font-bold opacity-50 mt-4">
          新潟県 『サンドしないサンド＜かつ＞ 板谷様
        </div>
      </div>
      <!-- User Video -->
      <div class="text-center mt-4 lg:mt-0 lg:flex-shrink-0">
        <a
          href="https://www.youtube.com/watch?v=4VUGm2v6B7E"
          target="_blank"
          class="inline-block"
        >
          <div>
            <img
              src="/LP-UserVoice-Video-1.jpg"
              class="rounded-lg w-64 touchable"
            />
          </div>
          <div class="inline-flex items-center mt-2">
            <i class="material-icons text-op-teal text-2xl"
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
    <div class="mt-2 mx-6 grid grid-cols-1 gap-2 lg:grid-cols-3">
      <div class="bg-white rounded-2xl px-6 pt-2 pb-5">
        <i class="material-icons text-3xl opacity-50">format_quote</i>
        <span class="text-sm opacity-90">
          <span class="highlight">営業時間外</span
          >でもテイクアウト注文が受付られるようになって、お客さまからとてもよろこばれています。お店としても<span
            class="highlight"
            >機会損失がなくなりました</span
          >。夜中に次の日の注文が入っていたのは驚きです。</span
        >
      </div>
      <div class="bg-white rounded-2xl px-6 pt-2 pb-5">
        <i class="material-icons text-3xl opacity-50">format_quote</i>
        <span class="text-sm opacity-90">
          電話注文ではどうしても注文の聞き間違えがあり、お客さんにもご迷惑をかけていたのですが、オンラインになってから<span
            class="highlight"
            >注文の間違いがなくなり</span
          >、安心して調理に専念できます。</span
        >
      </div>
      <div class="bg-white rounded-2xl px-6 pt-2 pb-5">
        <i class="material-icons text-3xl opacity-50">format_quote</i>
        <span class="text-sm opacity-90">
          注文が入った時に<span class="highlight">LINE</span>や<span
            class="highlight"
            >電話</span
          >で知らせてくれるので、見落としがなくなりました！</span
        >
      </div>
      <div class="bg-white rounded-2xl px-6 pt-2 pb-5">
        <i class="material-icons text-3xl opacity-50">format_quote</i>
        <span class="text-sm opacity-90">
          <span class="highlight">オンラインで手軽に決済</span
          >できるようになり、お客さまにも喜ばれています。お店としても<span
            class="highlight"
            >「おつりの用意」が不要</span
          >になりました。</span
        >
      </div>
      <div class="bg-white rounded-2xl px-6 pt-2 pb-5">
        <i class="material-icons text-3xl opacity-50">format_quote</i>
        <span class="text-sm opacity-90">
          お客様の<span class="highlight">購入履歴もエクセルで確認</span
          >できるので常連さん、リピーターさんの<span class="highlight"
            >より的確な把握</span
          >ができるようになりました。</span
        >
      </div>
      <div class="bg-white rounded-2xl px-6 pt-2 pb-5">
        <i class="material-icons text-3xl opacity-50">format_quote</i>
        <span class="text-sm opacity-90">
          毎月の売上がエクセルで確認できて、記帳が楽になりました。<span
            class="highlight"
            >日々の雑務を大幅に効率化</span
          >でき、万年人手不足の当店の大きなサポーターです！</span
        >
      </div>
    </div>

    <!-- Screenshots -->
    <div class="mx-6 mt-4 text-center">
      <img src="/LP-Screenshots.png" class="rounded-2xl max-h-80 m-auto" />
    </div>

    <!-- More -->
    <div class="text-center mt-4">
      <a href="/l/tips" target="_blank">
        <div
          class="h-16 rounded-full bg-op-yellow inline-flex items-center px-8 shadow"
        >
          <span class="text-black opacity-60 text-xl font-bold">{{
            $t("lp.moreDetails")
          }}</span>
        </div>
      </a>
    </div>
  </div>
</template>

<script>
export default {};
</script>
<style scoped>
.highlight {
  background: linear-gradient(transparent 50%, #f6ff5f 50%);
  font-weight: bold;
}
</style>
