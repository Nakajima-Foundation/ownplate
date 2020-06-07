<template>
  <div>
    <!-- Article Header Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24 m-t-24">
          <!-- Back to Admin Top -->
          <nuxt-link :to="'/admin/restaurants'">
            <div class="op-button-pill bg-form m-r-16">
              <i class="material-icons c-primary s-18">home</i>
              <span class="c-primary t-button">{{$t("admin.news.adminTop")}}</span>
            </div>
          </nuxt-link>

          <!-- Back to News Top -->
          <nuxt-link :to="'/admin/news'">
            <div class="op-button-pill bg-form">
              <i class="material-icons c-primary s-18">list</i>
              <span class="c-primary t-button">{{$t("admin.news.newsTop")}}</span>
            </div>
          </nuxt-link>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>

    <!-- Article Body Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="columns is-gaplress">
          <div class="column is-three-fifths is-offset-one-fifth">
            <div class="m-l-24 m-r-24">
              <div class="m-t-24">
                <!-- Title -->
                <div class="t-h6 c-text-black-disabled">v0.5.1をリリースしました。</div>
                <div class="t-subtitle1 c-text-black-disabled m-t-8">2020.06.04</div>

                <!-- Body -->
                <div
                  class="article-p m-t-24 t-body1 c-text-black-high"
                >Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a erat et nulla elementum elementum. Suspendisse magna sem, cursus sed viverra et, suscipit sed arcu. Etiam suscipit elementum nibh at porta. Phasellus sit amet ante venenatis, facilisis tortor non, pellentesque diam. Aliquam ac rhoncus dui. Aenean scelerisque augue nec consequat elementum. Sed consectetur ut arcu sed ultricies. Sed ac cursus odio. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent et imperdiet magna. Nulla lobortis risus id laoreet sodales. Nulla facilisi. Pellentesque at tempus dui. Ut hendrerit arcu ligula, eget tincidunt tortor dapibus ut. Pellentesque volutpat pharetra orci nec ullamcorper.</div>

                <div
                  class="article-p m-t-24 t-body1 c-text-black-high"
                >シンギュラリティ・ソサエティは、技術の進歩により大きく変わろうとしている世の中に向けた活動をするNPO（非営利型一般社団法人）です。 「おもちかえり.com」は、Firebase と Vue という技術を使って作られています。</div>

                <div class="article-list m-t-24">
                  <ul>
                    <li>
                      ユーザ系
                      <ul>
                        <li>プロフィールページに「注文履歴」「サインアウト」「飲食店としてサインイン」のリンクを追加。</li>
                        <li>プロフィールページから友達設定をした直後に表示がアップデートされない問題を解決。</li>
                        <li>プロフィールページに「アカウント削除」を追加。</li>
                        <li>LINEとの連携済みの人に連携ボタンが表示されてしまうバグを修正。</li>
                        <li>入店・退店記録のページで、undefined になってしまうバグを修正。</li>
                        <li>オーダーページで、ログインしていない状態で見たときにログイン画面を出すように修正。</li>
                        <li>クレジットカード番号をstripe側に記録しておき、２度目からは入力しなくて良いように変更。</li>
                        <li>特定商取引のリンク追加。</li>
                        <li>心付けのオプションとして５％を追加。</li>
                        <li>CVCの説明を追加。</li>
                      </ul>
                    </li>
                    <li>
                      管理系
                      <ul>
                        <li>自分の店への入店・退店情報を見ることが出来るようにしました（匿名です）。</li>
                        <li>「受け取り時の支払い」を許すかどうかを指定できるようにしました。</li>
                        <li>PickUpの時間を変更可能に。</li>
                        <li>特定商取引の表記の為に、代表者氏名の入力を必須に。</li>
                        <li>オーダーリストページに、「音テスト」ボタンの追加。</li>
                      </ul>
                    </li>
                    <li>
                      共通
                      <ul>
                        <li>ホームページから、飲食店向けマニュアル、お客様向けマニュアルへのリンクを追加。</li>
                        <li>メニューにプロフィールページへのリンクを追加。</li>
                        <li>メニューから「サインアウト」「注文履歴」の削除。</li>
                      </ul>
                    </li>
                  </ul>
                </div>
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

<style lang="scss" scoped>
.article-list ul {
  list-style: outside;
  list-style-type: disc;
  padding-left: 24px;
}

.article-list > ul {
  list-style: none;
  padding: 0;
}
.article-list > ul > li {
  @extend .t-h6;
  @extend .c-text-black-disabled;
}
.article-list > ul > li:not(:first-child) {
  padding-top: 24px;
}

.article-list > ul > li ul li {
  @extend .t-body1;
  @extend .c-text-black-high;
  margin-top: 16px;
}
</style>
