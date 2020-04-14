import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";
import "firebase/auth";
import "firebase/functions";

import firebaseConfig from "@/config/firebase";

// ** 本番環境
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export const storage = firebase.storage();
export const auth = firebase.auth();
export const functions = firebase.functions();
export const authObject = firebase.auth;
export const firestore = firebase.firestore;
export const ownPlateConfig = firebaseConfig.ownPlate || {};
