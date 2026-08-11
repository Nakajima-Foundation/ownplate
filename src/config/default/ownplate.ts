export const firebaseConfig = {
  apiKey: "AIzaSyB0cf-NmboXttSnfw96hoGcH9o9axiGgh0",
  authDomain: "own-plate.firebaseapp.com",
  databaseURL: "https://own-plate.firebaseio.com",
  projectId: "own-plate",
  storageBucket: "own-plate.appspot.com",
  messagingSenderId: "19014867930",
  appId: "1:19014867930:web:dcd3046191b97b4182bee3",
  measurementId: "G-T3NN72K8R7",
};

export const ownPlateConfig = {
  siteName: "OwnPlate",
  restaurantPageTitle: "OwnPlate",
  siteDescription: "Zero Comission Take-out Service",
  region: "US",
  hostName: "ownplate.today",
  stripe: {
    dashboard: "https://dashboard.stripe.com/dashboard",
    search: "https://dashboard.stripe.com/search",
  },
};

export const sentryDsn =
  "https://370e22db44d64d028df9d40829999274@o391740.ingest.sentry.io/5238405";

// web-push generate-vapid-keys で生成した公開鍵。空の間は管理画面の Web Push 設定が無効になる
export const webPushVapidPublicKey = "";
