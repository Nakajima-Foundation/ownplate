import * as functions from "firebase-functions";
import * as express from "../functions/express/express";
import { secretKeys } from "./firebase";

export default functions
  .region("asia-northeast1")
  .runWith({
    maxInstances: 100,
    memory: "1GB" as "1GB",
    secrets: secretKeys,
  })
  .https.onRequest(express.app);
