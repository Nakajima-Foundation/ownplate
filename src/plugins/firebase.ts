import firebase from "firebase/compat/app";

// for v8
import "firebase/compat/firestore";

import { firebaseConfig } from "@/config/project";

// ** 本番環境
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export const firestore = firebase.firestore;
