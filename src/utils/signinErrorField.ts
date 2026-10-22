// サインインのエラーをどの欄の下に出すか。パスワードに起因するものはパスワード欄に出す。
const passwordErrorCodes = new Set([
  "auth/wrong-password",
  "auth/internal-error",
  "auth/missing-password",
]);

export const signinErrorField = (code: string): "password" | "email" =>
  passwordErrorCodes.has(code) ? "password" : "email";
