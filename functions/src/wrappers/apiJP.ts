// import * as functions from "firebase-functions/v1";
import { onRequest } from "firebase-functions/v2/https";

import * as express from "../functions/express/express";
import { secretKeys } from "./firebase";

export default onRequest(
  {
    region: "asia-northeast1",
    maxInstances: 100,
    timeoutSeconds: 10,
    memory: "1GiB",
    secrets: secretKeys,
  },
  express.app,
);
