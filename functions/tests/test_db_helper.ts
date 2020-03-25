import * as firebase from "@firebase/testing";
// import { readFileSync } from 'fs';

/*
 * ============
 *    Setup
 * ============
 */
const projectId = "firestore-emulator-ownplate";
const coverageUrl = `http://localhost:8080/emulator/v1/projects/${projectId}:ruleCoverage.html`;

// const rules = readFileSync("firestore.rules", "utf8");

export const adminDB = () => {
  return  firebase.initializeAdminApp({
    projectId: projectId
  }).firestore();
}

export const clearData = async() => {
  await firebase.clearFirestoreData({ projectId });
}

//export const setRule = async() => {
//  await firebase.loadFirestoreRules({ projectId, rules });
//}

export const initHook = () => {
  beforeEach(async () => {
    // Clear the database between tests
  });

  before(async () => {
    await clearData();
  });

  after(async () => {
    await Promise.all(firebase.apps().map(app => app.delete()));
    console.log(`View rule coverage information at ${coverageUrl}\n`);
  });
};
