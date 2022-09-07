import { initializeApp } from "firebase/app";
const {
  initializeAppCheck,
  ReCaptchaV3Provider,
} = require("firebase/app-check");

import { firebaseConfig, appCheckKey } from "@/config/project";
const firebaseApp = initializeApp(firebaseConfig);

const appCheck = initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaV3Provider(appCheckKey),
  isTokenAutoRefreshEnabled: true,
});

// for V9
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

export const db = getFirestore();
export const auth = getAuth();
export const functions = getFunctions(firebaseApp, "us-central1");
export const functionsJP = getFunctions(firebaseApp, "asia-northeast1");
export const analytics = getAnalytics();

export default firebaseApp;
