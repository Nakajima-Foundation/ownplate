import * as functions from "firebase-functions";
import * as express from "../functions/express/express";
import { secretKeys } from "./firebase";

export default functions
  .region("asia-northeast1")
  .runWith({
    maxInstances: 100,
    timeoutSeconds: 10,
    memory: "1GB" as const,
    secrets: secretKeys,
  })
  .https.onRequest(express.app);
