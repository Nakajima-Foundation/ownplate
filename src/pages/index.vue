<template>
  <div>
    <!-- For Super Admin -->
    <div v-if="$store.getters.isSuperAdmin" class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24 m-t-24">
          <div class="bg-form r-8 p-l-24 p-r-24 p-t-24 p-b-24">
            <!-- Go to Super Admin Page -->
            <div class="align-center">
              <router-link to="/s">
                <div class="op-button-small primary" style="min-width: 256px;">
                  <span class="c-onprimary">Super Admin Page</span>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>

    <!-- For Operator -->
    <div v-if="$store.getters.isOperator" class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24 m-t-24">
          <div class="bg-form r-8 p-l-24 p-r-24 p-t-24 p-b-24">
            <!-- Go to Super Admin Page -->
            <div class="align-center">
              <router-link to="/o">
                <div class="op-button-small primary" style="min-width: 256px;">
                  <span class="c-onprimary">Operator Page</span>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>

    <!-- For Owner and User -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Left Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <!-- For Owner -->
          <div class="m-t-24">
            <div class="align-center m-b-8">
              <i class="material-icons c-text-black-disabled s-64">store</i>
            </div>

            <!-- Go to Owner Page -->
            <div class="align-center">
              <router-link to="/admin/restaurants">
                <div class="op-button-medium primary" style="min-width: 256px;">
                  <span class="c-onprimary">{{ $t("menu.admins") }}</span>
                </div>
              </router-link>
            </div>

            <!-- Go to Owner Manual -->
            <div class="align-center m-t-16" v-if="isJapan">
              <a href="https://gluepass.jp/g/ownplatejp/pg/Zy8VserQdTxFVKLaFcOK" target="_blank">
                <div class="op-button-text">
                  <i class="material-icons">help_outline</i>
                  <span>{{ $t("menu.adminManual") }}</span>
                </div>
              </a>
            </div>

            <!-- Go to Owner Support -->
            <div class="align-center" v-if="isJapan">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSfGR4kk65ynfkCRGJsvJz01HZf7AU1nGLL9Rn9i4G9-qiW6MQ/viewform"
                target="_blank"
              >
                <div class="op-button-text">
                  <i class="material-icons">mail_outline</i>
                  <span>{{ $t("menu.adminSupport") }}</span>
                </div>
              </a>
            </div>

            <!-- Go to Facebook User Group -->
            <div class="align-center" v-if="isJapan">
              <a href="https://www.facebook.com/groups/278028420106364/" target="_blank">
                <div class="op-button-text">
                  <i class="fab fa-facebook c-primary m-r-8" style="font-size:18px" />
                  <span>{{ $t("menu.adminUserGroup") }}</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <!-- For User -->
          <div class="m-t-24">
            <div class="align-center m-b-8">
              <i class="material-icons c-text-black-disabled s-64">tag_faces</i>
            </div>

            <!-- Go to User Page -->
            <div class="align-center" v-if="!hideUsersLink">
              <router-link to="/r">
                <div class="op-button-medium primary" style="min-width: 256px;">
                  <span class="c-onprimary">{{ $t("menu.users") }}</span>
                </div>
              </router-link>
            </div>

            <!-- Go to User Manual -->
            <div class="align-center m-t-16">
              <a href="https://gluepass.jp/g/ownplatejp/pg/zzDScN7kc1WgNQaA9J7v" target="_blank">
                <div class="op-button-text">
                  <i class="material-icons">help_outline</i>
                  <span>{{ $t("menu.userManual") }}</span>
                </div>
              </a>
            </div>

            <!-- Go to User Support -->
            <div class="align-center" v-if="isJapan">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSfGR4kk65ynfkCRGJsvJz01HZf7AU1nGLL9Rn9i4G9-qiW6MQ/viewform"
                target="_blank"
              >
                <div class="op-button-text">
                  <i class="material-icons">mail_outline</i>
                  <span>{{ $t("menu.userSupport") }}</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>

    <!-- Home Header Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="columns is-gapless">
          <div class="column is-narrow w-24"></div>
          <div class="column">
            <!-- Feature Hero -->
            <div class="bg-ownplate-yellow r-8 align-center m-t-24">
              <div class="h-8 bg-ownplate-yellow is-invisible-tablet"></div>
              <div>
                <img
                  style="height: 416px;"
                  class="cover is-hidden-mobile"
                  :src="`/${this.featureHeroTablet}`"
                />
                <img
                  style="height: 752px;"
                  class="cover is-hidden-tablet"
                  :src="`/${this.featureHeroMobile}`"
                />
              </div>
              <div class="h-8 bg-ownplate-yellow is-invisible-tablet"></div>
            </div>
          </div>
          <div class="column is-narrow w-24"></div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>

    <!-- Home Body Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="columns is-gaplress">
          <div class="column is-three-fifths is-offset-one-fifth">
            <div class="m-l-24 m-r-24">
              <!-- English -->
              <div v-if="!isLocaleJapan">
                <div class="t-h6 c-text-black-disabled m-t-48">About</div>
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
                  We are building
                  {{ $t("serviceName." + this.serviceKey) }} with Firebase
                  (Google) + Vue (open source), which allows us to develop this
                  service in a very short period of time.
                </div>
                <div class="t-body1 c-text-black-high m-t-24">Sincerely,</div>
                <div
                  class="t-body1 c-text-black-high m-t-24"
                >Satoshi Nakajima, chairman of Singularity Society</div>
              </div>

              <!-- Japanese -->
              <div v-else>
                <div class="t-h6 c-text-black-disabled m-t-48">このサービスについて</div>
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
                  「おもちかえり.com」は、Firebase と Vue
                  という技術を使って作られています。
                </div>
                <div class="t-body1 c-text-black-high m-t-24">代表理事 中島聡</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>
  </div>
</template>

<script>
import { releaseConfig } from "~/plugins/config.js";

export default {
  name: "HomePage",

  computed: {
    hideUsersLink() {
      return releaseConfig.hideUsersLink;
    },
    featureHeroMobile() {
      return this.regionalSetting.FeatureHeroMobile[
        this.isLocaleJapan ? "ja" : "en"
      ];
    },
    featureHeroTablet() {
      return this.regionalSetting.FeatureHeroTablet[
        this.isLocaleJapan ? "ja" : "en"
      ];
    }
  }
};
</script>
