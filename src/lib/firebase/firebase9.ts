import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

import { firebaseConfig, appCheckKey } from "@/config/project";

const firebaseApp = initializeApp(firebaseConfig);

if (location.hostname === "localhost") {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

const appCheck = initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaV3Provider(appCheckKey),
  isTokenAutoRefreshEnabled: true,
});

// for V9
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { FirestoreSettings, initializeFirestore } from "firebase/firestore";

// export const db = getFirestore();
const theSettings: FirestoreSettings = {
  experimentalForceLongPolling: true,
};
export const db = initializeFirestore(firebaseApp, theSettings);

export const auth = getAuth();
export const functions = getFunctions(firebaseApp, "us-central1");
export const functionsJP = getFunctions(firebaseApp, "asia-northeast1");
export const analytics = getAnalytics();

export default firebaseApp;
