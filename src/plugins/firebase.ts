import firebase from "firebase/compat/app";

// for v8
import "firebase/compat/firestore";

import { firebaseConfig } from "@/config/project";

// ** 本番環境
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const _db = firebase.firestore();
_db.settings({ experimentalForceLongPolling: true });
export const db = _db;
export const firestore = firebase.firestore;
