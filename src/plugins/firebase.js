import firebase from "firebase";

// ** 本番環境
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyDOQ1RAA1jMWDlYvRRx5ptE8aZLyNXUX1A",
    authDomain: "shushi-demae.firebaseapp.com",
    databaseURL: "https://shushi-demae.firebaseio.com",
    projectId: "shushi-demae",
    storageBucket: "shushi-demae.appspot.com",
    messagingSenderId: "321877235909",
    appId: "1:595681126202:web:31de6345fb77b8a67922a3"
  });
}

export const db = firebase.firestore();
export const storage = firebase.storage();
