import * as functions from "firebase-functions";

export default functions
  .region("asia-northeast1")
  .runWith({
    memory: "1GB" as "1GB",
    maxInstances: 50,
  })
  .auth.user().beforeSignIn((user, context) => {
    return {
      sessionClaims: {
        signInIpAddress: context.ipAddress,
      },
    };
  });
