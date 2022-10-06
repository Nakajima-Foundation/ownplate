import * as functions from "firebase-functions";
import * as express from "../functions/express";

export default functions
  .runWith({
    maxInstances: 100,
    memory: "1GB" as "1GB",
  })
  .https.onRequest(express.app);
