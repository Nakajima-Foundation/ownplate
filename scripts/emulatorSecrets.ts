// Functions エミュレーターへ渡す偽の秘密。ここには純粋な処理だけを置く
// （実際に書き出すのは writeEmulatorSecrets.ts）。

// 自分が書いたものかを見分ける印。人が置いた本物を消さないため。
export const SECRET_FILE_MARKER = "# e2e";

// 本物と見間違えないもの。試験は値を使わないので中身は何でもよいが、
// **空にはできない。** 空の値は「無い」と同じに扱われ、その一つのために
// エミュレーターが Secret Manager へ行く。
const PLACEHOLDER = "e2e-emulator-not-a-real-secret";

// 関数が宣言する秘密の一覧は functions/src/wrappers/firebase.ts が持っている。
// 一覧をここにも書くと、秘密が足された日に古びる。古びたことは CI が赤くなるまで
// 分からない（手元は本物の認証が効いてしまう）ので、実物から読む。
const SECRET_KEYS_ARRAY = /export const secretKeys = \[([^\]]*)\]/;
const QUOTED_NAME = /"([A-Z0-9_]+)"/g;

export const collectSecretNames = (wrapperSource: string): string[] => {
  const matched = SECRET_KEYS_ARRAY.exec(wrapperSource);
  if (matched === null) {
    throw new Error(
      "secretKeys の並びが読めません。数え方が実物に追いついていません。",
    );
  }
  return [...matched[1].matchAll(QUOTED_NAME)].map((name) => name[1]);
};

export const renderSecretFile = (names: string[]): string =>
  [
    SECRET_FILE_MARKER,
    ...names.map((name) => `${name}=${PLACEHOLDER}`),
    "",
  ].join("\n");

export const writtenByUs = (contents: string): boolean =>
  contents.startsWith(`${SECRET_FILE_MARKER}\n`);
