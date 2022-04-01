import { initializeApp } from "firebase/app";

import { firebaseConfig } from "@/config/project";

const firebaseApp = initializeApp(firebaseConfig);

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
