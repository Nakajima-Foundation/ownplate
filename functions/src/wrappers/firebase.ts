import { HttpsError } from "firebase-functions/v2/https";

// App Check は本番では必ず効かせる。外すのはエミュレーターの中だけ。
// FUNCTIONS_EMULATOR は Firebase のエミュレーター実行環境だけが立てる印で、
// デプロイ先の Cloud Functions では立たない。
export const shouldEnforceAppCheck = (env: NodeJS.ProcessEnv): boolean =>
  env.FUNCTIONS_EMULATOR !== "true";

export const enforceAppCheck = shouldEnforceAppCheck(process.env);

// App Check の判定は 27 の wrapper に同じ形で散っていた。一箇所にまとめて、
// 外すのはエミュレーターのときだけにする。== undefined は null も弾くので、
// 振る舞いを変えないよう両方を明示する。
export const requireAppCheck = (context: { app?: unknown }): void => {
  if (enforceAppCheck && (context.app === undefined || context.app === null)) {
    throw new HttpsError(
      "failed-precondition",
      "The function must be called from an App Check verified app.",
    );
  }
};

export const secretKeys = [
  "AWS_ID",
  "AWS_SECRET",
  "AWS_SES_USER",
  "AWS_SES_PASS",
  "STRIPE_SECRET",
  "STRIPE_WH_SECRET",

  "LIFF_SALT",
  "LINE_MESSAGE_TOKEN",
  "LINE_SECRET_KEY",
  "TWILIO_SID",
  "TWILIO_TOKEN",
  "TWILIO_PHONE",

  "SENTY_DSN",
];
