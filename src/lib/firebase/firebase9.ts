import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

import { firebaseConfig, appCheckKey } from "@/config/project";
import {
  AUTH_EMULATOR_PORT,
  EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
} from "@/config/emulatorPorts";

// e2e をエミュレーターに向けるときだけ真。本番の build では未定義なので、
// 下の分岐ごと消える。
const useEmulator = import.meta.env.VITE_FIREBASE_EMULATOR === "true";

const firebaseApp = initializeApp(firebaseConfig);

if (import.meta.env.DEV && location.hostname === "localhost") {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

// App Check は本物の鍵に問い合わせる。エミュレーターには相手がいないので繋がない。
if (!useEmulator) {
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(appCheckKey),
    isTokenAutoRefreshEnabled: true,
  });
}

// for V9
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";
// import { getFirestore } from "firebase/firestore";
import {
  connectFirestoreEmulator,
  FirestoreSettings,
  initializeFirestore,
} from "firebase/firestore";

// export const db = getFirestore();
const theSettings: FirestoreSettings = {
  experimentalForceLongPolling: true,
};
export const db = initializeFirestore(firebaseApp, theSettings);

export const auth = getAuth();
export const functions = getFunctions(firebaseApp, "us-central1");
export const functionsJP = getFunctions(firebaseApp, "asia-northeast1");
export const analytics = getAnalytics();

if (useEmulator) {
  connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${AUTH_EMULATOR_PORT}`, {
    disableWarnings: true,
  });
  connectFirestoreEmulator(db, EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);
}

export default firebaseApp;
