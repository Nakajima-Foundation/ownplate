export const firebaseConfig = {
  apiKey: "AIzaSyAAkqHp7A4d7NY1RDPLigUibDtrkhWxZCM",
  authDomain: "ownplate-jp.firebaseapp.com",
  databaseURL: "https://ownplate-jp.firebaseio.com",
  projectId: "ownplate-jp",
  storageBucket: "ownplate-jp.appspot.com",
  messagingSenderId: "346339540564",
  appId: "1:346339540564:web:c0a6bd01892e01e4c1f7c1",
  measurementId: "G-07KSY8S610",
};

export const ownPlateConfig = {
  siteName:
    "おもちかえり.com / 無料で使えるテイクアウト・お持ち帰り支援サービス",
  restaurantPageTitle: "テイクアウト・お持ち帰り / おもちかえり.com",
  siteDescription:
    "アプリインストール不要で、すぐに使えるテイクアウト・お持ち帰りサービス。食べたいお店がすぐに見つかり、オンラインで注文可能。レストランに優しい決済手数料以外は全て無料で、すぐに使えます。",
  region: "JP",
  hostName: "omochikaeri.com",
  analyticsId: "analytics_234424279",
  stripe: {
    clientId: "ca_HAiZ4FX4JuoHdN8tcGjlEypJZFHErPRo",
    apiKey: "pk_live_XEjVg6hx6kgu5WSiGOnEiEHd0077C0E2e4",
    dashboard: "https://dashboard.stripe.com/dashboard",
    search: "https://dashboard.stripe.com/search",
  },
  line: {
    LOGIN_CHANNEL_ID: "1654216149",
    TRACK_CHANNEL_ID: "1654259709",
    FRIEND_LINK: "https://lin.ee/30PDYymgm",
  },
};

export const sentryDsn =
  "https://127aea38118f4362a1167c0bc5607846@o391740.ingest.sentry.io/5238403";

export const appCheckKey = "6LdsEOEhAAAAADBDU9ynD4TiDjf-RNOyOrjDNctg";

export const gtmID = "GTM-WF3G3ZG";
export const GAPIKey = "AIzaSyBopNQwD1RT2k9dLqH6WYPWIkMZF3RWXMQ";
export const GMAPId = "DEMO_MAP_ID";
export const fromEmail = "noreply@omochikaeri.com";
export const bucketRegion = "asia-northeast1";

// Firebase Console → プロジェクト設定 → Cloud Messaging → ウェブプッシュ証明書 の公開鍵。
// 空の間は Web Push の UI が無効になるので、鍵が無くてもビルドと実行はできる
export const webPushVapidPublicKey = "BAhh4z8Y-VhoyhGae17EBEiPqUSxrR3jlf8rZLynocrjfxFkd5_C9mTGEhtuw2zLob7H5mlr_IJrZWmG14max9g";
