<template>
  <section class="section">
    <back-button url="/" />
    <h1 class="h1">About</h1>
    <p class="p">
      The COVID-19 has not only claimed the lives of many people,
      but it has also caused significant damage to the economy.
      In particular, restaurants and bars that offer "places for people to gather" have suffered directly
      from lockdown and shelter-in-place measures.
      At the result, millions of people were layed off,
      and thousands of restaurant owners have been forced to close their businesses.
    </p>
    <p class="p">
      We've created OwnPlate to help those restaurants and bars.
      With OwnPlate, restaurants can start take-out service with no extra fees (only credit card charges are required).
      The restaurant owners can create dedicated pages and register menu items there (no special skill is required),
      where customers can order and pay, then pick them up at restaurants.
    </p>
    <p class="p">
      We, Singularity Society, is a non-profit organization, consists of software engineers,
      designers and business people. We are building OwnPlate with Firebase (Google) + Vue (open source),
      which allows us to develop this service in a very short period of time.
    </p>
    <p class="p">
      Sincerely,
      <br />Satoshi Nakajima, chairman of Singularity Society
    </p>
    <hr />
    <h1 class="h1">このサービスについて</h1>
    <p class="p">
      新型コロナウィルスは、多くの人の命を奪っただけではなく、経済にも大きなダメージを与えました。
      特に、「人の集まる場所」を提供するレストランやバーは、都市封鎖や自宅待機により直接的な被害を被り、
      多くの失業者を生み出したし、閉業へと追い込まれた経営者も少なくありません。
    </p>
    <p class="p">
      私たちは、そんなレストランやバーを支援するために、OwnPlate を作りました。
      OwnPlate を使えば、レストランは、余計な手数料なしでテイクアウトサービスを始める事ができます。
      レストランは、専用のページを作り、そこにメニューを登録します（ウェブ・コンサルタントを雇う必要はありません）。
      顧客はそのページから注文し、支払いを済ませ、調理時間に合わせて店に取りに行くのです。
    </p>
    <p class="p">
      シンギュラリティ・ソサエティは、技術の進歩により大きく変わろうとしている世の中に向けた活動をするNPOです。
      OpenPlate は、Firebase と Vue という技術を使って作られています。
    </p>
    <p class="p">
      <br />代表理事 中島聡
    </p>
  </section>
</template>
<script>
import BackButton from "~/components/BackButton";
export default {
  components: {
    BackButton
  }
};
</script>
<style scoped>
.h1 {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
.p {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>
