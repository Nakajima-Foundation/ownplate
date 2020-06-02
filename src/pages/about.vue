<template>
  <div>
    <!-- About in English -->
    <div v-if="$i18n.locale !== 'ja'">
      <div class="columns is-gapless">
        <!-- Left Gap -->
        <div class="column is-narrow w-24"></div>
        <!-- Left Column -->
        <div class="column">
          <!-- Feature Hero -->
          <div class="columns is-gapless">
            <div class="column is-narrow w-24"></div>
            <div class="column">
              <div class="is-hidden-mobile h-24"></div>
              <div>
                <!-- For Mobile -->
                <img
                  style="height: 752px;"
                  class="cover is-hidden-tablet"
                  :src="`/${this.featureHero}`"
                />
                <!-- For Tablet -->
                <img
                  style="height: 752px;"
                  class="cover r-8 is-hidden-mobile"
                  :src="`/${this.featureHero}`"
                />
              </div>
            </div>
            <div class="column is-narrow w-24"></div>
          </div>
        </div>
        <!-- Right Column -->
        <div class="column">
          <div class="m-l-24 m-r-24">
            <div class="t-h6 c-text-black-disabled m-t-24">About</div>
            <div class="t-body1 c-text-black-high m-t-24">
              The COVID-19 has not only claimed the lives of many people,
              but it has also caused significant damage to the economy.
              In particular, restaurants and bars that offer "places for people to gather" have suffered directly
              from lockdown and shelter-in-place measures.
              At the result, millions of people were layed off,
              and thousands of restaurant owners have been forced to close their businesses.
            </div>
            <div class="t-body1 c-text-black-high m-t-24">
              We've created {{$t('serviceName.' + this.serviceKey)}} to help those restaurants and bars.
              With {{$t('serviceName.' + this.serviceKey)}}, restaurants can start take-out service with no extra fees (only credit card charges are required).
              The restaurant owners can create dedicated pages and register menu items there (no special skill is required),
              where customers can order and pay, then pick them up at restaurants.
            </div>
            <div class="t-body1 c-text-black-high m-t-24">
              We, Singularity Society, is a non-profit organization, consists of software engineers,
              designers and business people. We are building {{$t('serviceName.' + this.serviceKey)}} with Firebase (Google) + Vue (open source),
              which allows us to develop this service in a very short period of time.
            </div>
            <div class="t-body1 c-text-black-high m-t-24">Sincerely,</div>
            <div
              class="t-body1 c-text-black-high m-t-24"
            >Satoshi Nakajima, chairman of Singularity Society</div>
          </div>
        </div>
        <!-- Right Gap -->
        <div class="column is-narrow w-24"></div>
      </div>
    </div>

    <!-- About in Japanese -->
    <div v-else>
      <div class="columns is-gapless">
        <!-- Left Gap -->
        <div class="column is-narrow w-24"></div>
        <!-- Left Column -->
        <div class="column">
          <!-- Feature Hero -->
          <div class="columns is-gapless">
            <div class="column is-narrow w-24"></div>
            <div class="column">
              <div class="is-hidden-mobile h-24"></div>
              <div>
                <!-- For Mobile -->
                <img
                  style="height: 752px;"
                  class="cover is-hidden-tablet"
                  :src="`/${this.featureHero}`"
                />
                <!-- For Tablet -->
                <img
                  style="height: 752px;"
                  class="cover r-8 is-hidden-mobile"
                  :src="`/${this.featureHero}`"
                />
              </div>
            </div>
            <div class="column is-narrow w-24"></div>
          </div>
        </div>
        <!-- Right Column -->
        <div class="column">
          <div class="m-l-24 m-r-24">
            <div class="t-h6 c-text-black-disabled m-t-24">このサービスについて</div>
            <div class="t-body1 c-text-black-high m-t-24">
              新型コロナウィルスは、多くの人の命を奪っただけではなく、経済にも大きなダメージを与えました。
              特に、「人の集まる場所」を提供するレストランやバーは、都市封鎖や自宅待機により直接的な被害を被り、
              多くの失業者を生み出したし、閉業へと追い込まれた経営者も少なくありません。
            </div>
            <div class="t-body1 c-text-black-high m-t-24">
              私たちは、そんなレストランやバーを支援するために、「{{$t('serviceName.' + this.serviceKey)}}」を作りました。
              「{{$t('serviceName.' + this.serviceKey)}}」を使えば、レストランは、余計な手数料なしでテイクアウトサービスを始める事ができます。
              レストランは、専用のページを作り、そこにメニューを登録します（ウェブ・コンサルタントを雇う必要はありません）。
              顧客はそのページから注文し、支払いを済ませ、調理時間に合わせて店に取りに行くのです。
            </div>
            <div class="t-body1 c-text-black-high m-t-24">
              シンギュラリティ・ソサエティは、技術の進歩により大きく変わろうとしている世の中に向けた活動をするNPO（非営利型一般社団法人）です。
              「おもちかえり.com」は、Firebase と Vue という技術を使って作られています。
            </div>
            <div class="t-body1 c-text-black-high m-t-24">代表理事 中島聡</div>
          </div>
        </div>
        <!-- Right Gap -->
        <div class="column is-narrow w-24"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { regionalSettings } from "~/plugins/constant.js";
import { ownPlateConfig } from "@/config/project";
export default {
  data() {
    return {
      regionalSetting: regionalSettings[ownPlateConfig.region || "US"]
    };
  },
  computed: {
    serviceKey() {
      return this.$store.state.server.region === "JP"
        ? "omochikaeri"
        : "ownPlate";
    },
    featureHero() {
      return this.regionalSetting.FeatureHero[
        this.$i18n.locale === "ja" ? "ja" : "en"
      ];
    }
  },
  created() {
    console.log(process.env.CIRCLE_SHA1);
  }
};
</script>
