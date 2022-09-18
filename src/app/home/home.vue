<template>
  <div>
    <!-- For Owner and User -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-6"></div>
      <!-- Left Column -->
      <div class="column">
        <div class="ml-6 mr-6">
          <!-- For Owner -->
          <div class="mt-6">
            <div class="align-center mb-2">
              <i class="material-icons text-black text-opacity-40 s-64">store</i>
            </div>

            <!-- Go to Owner Page -->
            <div class="align-center">
              <router-link to="/admin/restaurants">
                <div
                  class="h-16 rounded-full bg-op-teal inline-flex items-center px-12 shadow"
                >
                  <span class="text-white text-xl font-bold">
                    {{ $t("menu.admins") }}</span
                  >
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="column">
        <div class="ml-6 mr-6">
          <!-- For User -->
          <div class="mt-6">
            <div class="align-center mb-2">
              <i class="material-icons text-black text-opacity-40 s-64">tag_faces</i>
            </div>

            <!-- Go to User Page -->
            <div class="align-center">
              <router-link to="/r">
                <div
                  class="h-16 rounded-full bg-op-teal inline-flex items-center px-12 shadow"
                >
                  <span class="text-white text-xl font-bold">{{
                    $t("menu.users")
                  }}</span>
                </div>
              </router-link>
            </div>

            <!-- Go to User Manual -->
            <div class="align-center mt-4">
              <a
                href="https://gluepass.jp/g/ownplatejp/pg/zzDScN7kc1WgNQaA9J7v"
                target="_blank"
              >
                <div class="op-button-text">
                  <i class="material-icons">help_outline</i>
                  <span>{{ $t("menu.userManual") }}</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-6"></div>
    </div>

    <!-- Home Header Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-6"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="columns is-gapless">
          <div class="column is-narrow w-6"></div>
          <div class="column">
            <!-- Feature Hero -->
            <div class="bg-ownplate-yellow rounded-lg align-center mt-6">
              <div class="h-2 bg-ownplate-yellow is-invisible-tablet"></div>
              <div>
                <img
                  style="height: 416px"
                  class="object-cover is-hidden-mobile"
                  :src="`/${this.featureHeroTablet}`"
                />
                <img
                  style="height: 752px"
                  class="object-cover is-hidden-tablet"
                  :src="`/${this.featureHeroMobile}`"
                />
              </div>
              <div class="h-2 bg-ownplate-yellow is-invisible-tablet"></div>
            </div>
          </div>
          <div class="column is-narrow w-6"></div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-6"></div>
    </div>

    <!-- Home Body Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-6"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="columns is-gaplress">
          <div class="column is-three-fifths is-offset-one-fifth">
            <div class="ml-6 mr-6">
              <!-- English -->
              <div v-if="!isLocaleJapan">
                <div class="t-h6 text-black text-opacity-40 mt-8">About</div>
                <div class="text-black text-opacity-80 mt-6">
                  The COVID-19 has not only claimed the lives of many people,
                  but it has also caused significant damage to the economy. In
                  particular, restaurants and bars that offer "places for people
                  to gather" have suffered directly from lockdown and
                  shelter-in-place measures. At the result, millions of people
                  were layed off, and thousands of restaurant owners have been
                  forced to close their businesses.
                </div>
                <div class="text-black text-opacity-80 mt-6">
                  We've created {{ $t("serviceName." + serviceKey) }} to help
                  those restaurants and bars. With
                  {{ $t("serviceName." + serviceKey) }}, restaurants can start
                  take-out service with no extra fees (only credit card charges
                  are required). The restaurant owners can create dedicated
                  pages and register menu items there (no special skill is
                  required), where customers can order and pay, then pick them
                  up at restaurants.
                </div>
                <div class="text-black text-opacity-80 mt-6">
                  We, Singularity Society, is a non-profit organization,
                  consists of software engineers, designers and business people.
                  We are building
                  {{ $t("serviceName." + serviceKey) }} with Firebase (Google) +
                  Vue (open source), which allows us to develop this service in
                  a very short period of time.
                </div>
                <div class="text-black text-opacity-80 mt-6">Sincerely,</div>
                <div class="text-black text-opacity-80 mt-6">
                  Satoshi Nakajima, chairman of Singularity Society
                </div>
              </div>

              <!-- Japanese -->
              <div v-else>
                <div class="t-h6 text-black text-opacity-40 mt-8">
                  このサービスについて
                </div>
                <div class="text-black text-opacity-80 mt-6">
                  新型コロナウィルスは、多くの人の命を奪っただけではなく、経済にも大きなダメージを与えました。
                  特に、「人の集まる場所」を提供するレストランやバーは、都市封鎖や自宅待機により直接的な被害を被り、
                  多くの失業者を生み出したし、閉業へと追い込まれた経営者も少なくありません。
                </div>
                <div class="text-black text-opacity-80 mt-6">
                  私たちは、そんなレストランやバーを支援するために、「{{
                    $t("serviceName." + serviceKey)
                  }}」を作りました。 「{{
                    $t("serviceName." + serviceKey)
                  }}」を使えば、レストランは、余計な手数料なしでテイクアウトサービスを始める事ができます。
                  レストランは、専用のページを作り、そこにメニューを登録します（ウェブ・コンサルタントを雇う必要はありません）。
                  顧客はそのページから注文し、支払いを済ませ、調理時間に合わせて店に取りに行くのです。
                </div>
                <div class="text-black text-opacity-80 mt-6">
                  シンギュラリティ・ソサエティは、技術の進歩により大きく変わろうとしている世の中に向けた活動をするNPO（非営利型一般社団法人）です。
                  「おもちかえり.com」は、Firebase と Vue
                  という技術を使って作られています。
                </div>
                <div class="text-black text-opacity-80 mt-6">
                  代表理事 中島聡
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
import { defineComponent } from "@vue/composition-api";
import { serviceKey } from "@/utils/utils";

export default defineComponent({
  setup() {
    return { serviceKey };
  },
});
</script>
