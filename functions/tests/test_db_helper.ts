import * as firebase from "@firebase/rules-unit-testing";
// import { readFileSync } from 'fs';

/*
 * ============
 *    Setup
 * ============
 */
const projectId = "firestore-emulator-ownplate";
const coverageUrl = `http://localhost:8080/emulator/v1/projects/${projectId}:ruleCoverage.html`;

// const rules = readFileSync("firestore.rules", "utf8");

export const adminDB = async () => {
  const testEnv = await firebase.initializeTestEnvironment({
    projectId,
    firestore: {
      host: "localhost",
      port: 8080,
      // rules: readFileSync('../firestore.rules', 'utf8')
    },
  });
  const authenticatedContext = testEnv.authenticatedContext("uid string");
  const clientDB = authenticatedContext.firestore();
  return clientDB;
  /*
  return firebase
    .initializeAdminApp({
      projectId: projectId,
    })
    .firestore();
  */
};

export const clearData = async () => {
  const testEnv = await firebase.initializeTestEnvironment({
    projectId,
    firestore: {
      host: "localhost",
      port: 8080,
      // rules: readFileSync('../firestore.rules', 'utf8')
    },
  });
  await testEnv.clearFirestore();

  // await firebase.clearFirestoreData({ projectId });
};

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
    //await Promise.all(firebase.apps().map((app) => app.delete()));
    console.log(`View rule coverage information at ${coverageUrl}\n`);
  });
};
