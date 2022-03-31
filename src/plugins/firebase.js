import firebase from "firebase/compat/app"
import { initializeApp } from "firebase/app"

// for v8
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/auth";
import "firebase/compat/functions";
import "firebase/compat/analytics";

import { firebaseConfig } from "@/config/project";

// ** 本番環境
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export const storage = firebase.storage();
export const auth = firebase.auth();
export const functions = firebase.functions();
export const functionsJp = firebase.app().functions("asia-northeast1");
export const authObject = firebase.auth;
export const firestore = firebase.firestore;
export const analytics = firebase.analytics();
