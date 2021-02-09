<template>
  <div>
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-6"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="columns is-gaplress">
          <div class="column is-three-fifths is-offset-one-fifth">
            <div class="m-l-24 m-r-24">
              <!-- Title -->
              <div
                class="align-center is-size-3-tablet is-size-5-mobile c-text-black-disabled p-t-48"
                style="line-height: 1.4; font-weight: bold;"
              >
                <div v-if="!isLocaleJapan">
                  About
                </div>
                <div v-else>
                  このサービスについて
                </div>
              </div>

              <!-- English -->
              <div v-if="!isLocaleJapan">
                <div class="t-body1 c-text-black-high m-t-24">
                  The COVID-19 has not only claimed the lives of many people,
                  but it has also caused significant damage to the economy. In
                  particular, restaurants and bars that offer "places for people
                  to gather" have suffered directly from lockdown and
                  shelter-in-place measures. At the result, millions of people
                  were layed off, and thousands of restaurant owners have been
                  forced to close their businesses.
                </div>
                <div class="t-body1 c-text-black-high m-t-24">
                  We've created {{ $t("serviceName." + this.serviceKey) }} to
                  help those restaurants and bars. With
                  {{ $t("serviceName." + this.serviceKey) }}, restaurants can
                  start take-out service with no extra fees (only credit card
                  charges are required). The restaurant owners can create
                  dedicated pages and register menu items there (no special
                  skill is required), where customers can order and pay, then
                  pick them up at restaurants.
                </div>
                <div class="t-body1 c-text-black-high m-t-24">
                  We, Singularity Society, is a non-profit organization,
                  consists of software engineers, designers and business people.
                </div>
                <div class="t-body1 c-text-black-high m-t-24">Sincerely,</div>
              </div>

              <!-- Japanese -->
              <div v-else>
                <div class="t-body1 c-text-black-high m-t-24">
                  新型コロナウィルスは、多くの人の命を奪っただけではなく、経済にも大きなダメージを与えました。
                  特に、「人の集まる場所」を提供するレストランやバーは、都市封鎖や自宅待機により直接的な被害を被り、
                  多くの失業者を生み出したし、閉業へと追い込まれた経営者も少なくありません。
                </div>
                <div class="t-body1 c-text-black-high m-t-24">
                  私たちは、そんなレストランやバーを支援するために、「{{
                    $t("serviceName." + this.serviceKey)
                  }}」を作りました。 「{{
                    $t("serviceName." + this.serviceKey)
                  }}」を使えば、レストランは、余計な手数料なしでテイクアウトサービスを始める事ができます。
                  レストランは、専用のページを作り、そこにメニューを登録します（ウェブ・コンサルタントを雇う必要はありません）。
                  顧客はそのページから注文し、支払いを済ませ、調理時間に合わせて店に取りに行くのです。
                </div>
                <div class="t-body1 c-text-black-high m-t-24">
                  シンギュラリティ・ソサエティは、技術の進歩により大きく変わろうとしている世の中に向けた活動をするNPO（非営利型一般社団法人）です。
                </div>
              </div>

              <!-- Profile -->
              <div class="align-center p-t-24 p-b-24">
                <img src="/Profile-SNakajima.jpg" class="w-32 r-256" />
                <div class="align-center t-body1 c-text-black-high p-t-8">
                  <div v-if="!isLocaleJapan">
                    Satoshi Nakajima<br />Chairman of Singularity Society
                  </div>
                  <div v-else>
                    シンギュラリティ・ソサエティ<br />代表理事 中島聡
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-6"></div>
    </div>
  </div>
</template>
<script>
export default {};
</script>
