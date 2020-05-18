import * as functions from 'firebase-functions';
import * as express from '../functions/express';

export default functions.https.onRequest(express.app);
