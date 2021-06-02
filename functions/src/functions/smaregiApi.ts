import express from 'express';
import * as admin from 'firebase-admin';
// import { ownPlateConfig } from '../common/project';
// import * as Sentry from '@sentry/node';
import { response200 } from './apis';

export const smaregiRouter = express.Router();

if (!admin.apps.length) {
  admin.initializeApp();
}

let db = admin.firestore();

export const updateDb = (_db) => {
  db = _db;
}

const subscribe = async (req: any, res: any) => {
  console.log(JSON.stringify(req.headers));
  console.log(JSON.stringify(req.body));

  await db.collection("smaregiLog/log/subscribe").add({data: req.body, createdAt: admin.firestore.Timestamp.now()});
  return response200(res, {});
}
const webhook = async (req: any, res: any) => {
  console.log(JSON.stringify(req.headers));
  console.log(JSON.stringify(req.body));
  await db.collection("smaregiLog/log/webhook").add({data: req.body, createdAt: admin.firestore.Timestamp.now()});
  return response200(res, {});
}

smaregiRouter.post('/subscribe', subscribe);
smaregiRouter.post('/webhook', webhook);
