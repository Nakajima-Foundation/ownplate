import firebase from "firebase";
import firebaseConfig from "@/config/firebase";

// ** 本番環境
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export const storage = firebase.storage();
export const auth = firebase.auth();
