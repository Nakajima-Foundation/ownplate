import * as functions from "firebase-functions";
import * as express from "../functions/express/express";

export default functions
  .runWith({
    maxInstances: 100,
    memory: "1GB" as "1GB",
    secrets: ["STRIPE_SECRET", "STRIPE_WH_SECRET"],
  })
  .https.onRequest(express.app);
