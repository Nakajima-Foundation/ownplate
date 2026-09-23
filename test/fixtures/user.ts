import type { User } from "firebase/auth";

// Firebase が返す利用者ひとり分。店舗の管理者はメールで、注文者は電話番号で認証するので、
// **どちらが入っているかが種別そのもの**。試験は必要な項目だけ上書きして使う。
//
// 型が要求する項目は全部埋めてある。一部だけ渡して型を緩めると、Firebase が実際に返す
// 形と違うものを検証することになる。
const base: User = {
  uid: "test-uid",
  email: null,
  emailVerified: false,
  displayName: null,
  phoneNumber: null,
  photoURL: null,
  isAnonymous: false,
  tenantId: null,
  providerId: "firebase",
  refreshToken: "",
  metadata: {},
  providerData: [],
  delete: () => Promise.resolve(),
  getIdToken: () => Promise.resolve(""),
  getIdTokenResult: () => Promise.reject(new Error("試験では呼ばれない")),
  reload: () => Promise.resolve(),
  toJSON: () => ({}),
};

export const userFixture = (overrides: Partial<User> = {}): User => ({
  ...base,
  ...overrides,
});

// メールで入った店舗の管理者。
export const adminUser = (uid = "owner-uid") =>
  userFixture({ uid, email: "owner@example.com", emailVerified: true });

// 電話番号で入った注文者。
export const customerUser = (uid = "customer-uid") =>
  userFixture({ uid, phoneNumber: "+819012345678" });
