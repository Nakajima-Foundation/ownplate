import * as functions from 'firebase-functions';

import * as express from './functions/express';

export const api = functions.https.onRequest(express.app);
