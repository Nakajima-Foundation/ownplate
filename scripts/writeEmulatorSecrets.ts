// Functions エミュレーターは defineSecret の値を Google Secret Manager から取りに行く。
// 認証の無い CI では 403 で取れず、値が空のまま関数が走る。orderCreated は
// get_stripe_v2 で STRIPE_SECRET_KEY を要求して投げるので、画面には
// 「売り切れかもしれません」とだけ出て注文が通らない。
//
// **手元ではこれが起きない。** gcloud / firebase の認証が効いていると本物の
// 秘密が降りてくる。試験は本物を要らないので偽の値を置く。エミュレーターは
// 起動時にこの綴りを読むので、上がる前に書く必要がある。
import { existsSync, readFileSync, writeFileSync } from "node:fs";

import {
  collectSecretNames,
  renderSecretFile,
  writtenByUs,
} from "./emulatorSecrets.ts";

const SECRET_FILE = "functions/.secret.local";
const WRAPPER_FILE = "functions/src/wrappers/firebase.ts";

const main = () => {
  if (
    existsSync(SECRET_FILE) &&
    !writtenByUs(readFileSync(SECRET_FILE, "utf8"))
  ) {
    process.stdout.write(
      `${SECRET_FILE} があるのでそのまま使います（書き換えません）\n`,
    );
    return;
  }
  const names = collectSecretNames(readFileSync(WRAPPER_FILE, "utf8"));
  writeFileSync(SECRET_FILE, renderSecretFile(names));
  process.stdout.write(`${SECRET_FILE} に偽の値を置きました\n`);
};

main();
