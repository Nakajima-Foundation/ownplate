<template>
  <div>
    <b-navbar>
      <template slot="brand">
        <b-navbar-item tag="router-link" :to="{ path: '/' }">
          <!-- <img
            src="https://www.gstatic.com/devrel-devsite/prod/vf4743e4237527d72f4be8582639e4a529166b52e9bb628e797b1ed38800b278b/firebase/images/lockup.png"
            alt="Lightweight UI components for Vue.js based on Bulma"
          /> -->
          <p class="p-font bold logo">OwnPlate</p>
        </b-navbar-item>
      </template>

      <template slot="end">
        <b-navbar-dropdown
          class="b-navbar-item"
          spaced="true"
          hoverable
          right
          icon-left="github-circle"
        >
          <b-navbar-item href="/dist/mypage">
            <span class="icon">
              <i class="fas fa-th-list"></i>
            </span>
            <span class="nav-item">mypage</span>
          </b-navbar-item>
          <b-navbar-item href="/dist/mypage/profile">
            <span class="icon">
              <i class="fas fa-user-circle"></i>
            </span>
            <span class="nav-item">profile</span>
          </b-navbar-item>
          <b-navbar-item href="/dist/mypage/payment">
            <span class="icon">
              <i class="fas fa-money-check"></i>
            </span>
            <span class="nav-item">setting</span>
          </b-navbar-item>
          <b-navbar-item href="/dist/mypage/agreement">
            <span class="icon">
              <i class="fas fa-id-card"></i>
            </span>
            <span class="nav-item">payment</span>
          </b-navbar-item>
          <b-navbar-item href="/dist/mypage/billinghistory">
            <span class="icon">
              <i class="fas fa-history"></i>
            </span>
            <span class="nav-item">history</span>
          </b-navbar-item>
        </b-navbar-dropdown>
      </template>
    </b-navbar>

    <!-- pagesのコンポーネントが読み込まれる -->
    <nuxt style="max-width:100%;"></nuxt>
    <!-- pagesのコンポーネントが読み込まれる -->

    <footer class="footer" style="background-color: black!important;">
      <div class="footer-sections">
        <div class="columns is-desktop" style="margin-top:-3rem;">
          <div class="column">
            <div class="level-left">
              <p class="level-item p-font">
                <a>
                  <span class="icon has-text-info">
                    <i class="far fa-file-alt"></i>
                  </span>
                  Private
                </a>
              </p>
              <p class="level-item p-font">
                <a>
                  <span class="icon has-text-info">
                    <i class="far fa-file-alt"></i>
                  </span>
                  Tokushoho
                </a>
              </p>
              <p class="level-item p-font">
                <a>
                  <span class="icon has-text-info">
                    <i class="far fa-file-alt"></i>
                  </span>
                  Riyokiyku
                </a>
              </p>
              <p class="level-item p-font">
                <a>
                  <span class="icon has-text-info">
                    <i class="fas fa-info-circle"></i>
                  </span>
                  Contact
                </a>
              </p>
            </div>
          </div>
          <div class="column">
            <div class="level-left">
              <p class="level-item p-font">
                <a>
                  <span class="icon has-text-info">
                    <i class="far fa-envelope"></i>
                  </span>
                  Mail
                </a>
              </p>

            </div>

            <div class="mainichi-info" style="margin-top:1rem;">
              <p class="p-font-mini">
                TEL
                <span class="title" style="margin-left:1rem;">
                  0120-000-000
                </span>
              </p>
              <p class="p-font-mini">
                hugahuga 000-0000-0000
              </p>
              <p class="p-font-mini">
                TIme AM10:00〜PM5（Excluding weekends and holidays）
              </p>
            </div>
          </div>
        </div>

        <div class="content has-text-left">
          <p class="p-font-mini">
            hogahugapiyo
          </p>
          <p class="p-font-mini">
            Copyright Nakajima. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        {
          title: "Home",
          icon: "home",
          to: { name: "index" }
        },
        {
          title: "Inspire",
          icon: "lightbulb",
          to: { name: "inspire" }
        }
      ]
    };
  }
};
</script>
<style lang="scss">
.b-navbar-item {
  font-size: 0.9rem;
}

.footer-sections {
  width: 1200px;
  max-width: 100%;
  margin-right: auto;
  margin-left: auto;
  padding-top: 1rem;
}

.nav-item {
  padding-left: 0.8rem;
}

.mainichi-info .p-font-mini {
  line-height: 1.6rem;
}

.logo {
  color:rgb(255, 255, 255);
  font-weight: 900;
}
</style>
