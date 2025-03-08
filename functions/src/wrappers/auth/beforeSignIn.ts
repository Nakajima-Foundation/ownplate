import {
  beforeUserSignedIn,
} from "firebase-functions/v2/identity";

export default beforeUserSignedIn(
  {
    region: "asia-northeast1",
    memory: "1GiB",
  },
  (context) => {
    return {
      sessionClaims: {
        signInIpAddress: context.ipAddress,
      },
    };
  });
