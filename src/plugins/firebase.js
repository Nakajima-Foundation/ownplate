import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";
import "firebase/auth";
import "firebase/functions";
import "firebase/analytics";

import { firebaseConfig } from "@/config/project";

// ** 本番環境
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
}

export const db = firebase.firestore();
export const storage = firebase.storage();
export const auth = firebase.auth();
export const functions = firebase.functions();
export const authObject = firebase.auth;
export const firestore = firebase.firestore;
export const analytics = firebase.analytics();
