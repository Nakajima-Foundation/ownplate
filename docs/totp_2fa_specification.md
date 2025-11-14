# TOTP二要素認証 技術仕様書

## 概要

OwnPlateにFirebase Authenticationを使用したTOTP（Time-based One-Time Password）による二要素認証機能を実装。
ユーザーは任意で二要素認証を有効化でき、セキュリティを強化できる。

## 主要機能

### 1. 新規登録時のTOTP登録（任意）

- **対象画面**: `/admin/user/signup` (SignUpPage.vue)
- **フロー**:
  1. ユーザーがメールアドレス・パスワードで新規登録
  2. アカウント作成後、TOTP登録画面を表示
  3. ユーザーはQRコードをスキャンして認証アプリに登録
  4. 6桁の認証コードを入力して登録完了
  5. スキップも可能（後でプロフィール画面から設定可能）

### 2. サインイン時のTOTP検証

- **対象画面**: `/admin/user/signin` (SignInPage.vue)
- **フロー**:
  1. ユーザーがメールアドレス・パスワードを入力
  2. TOTPが有効なアカウントの場合、自動的にTOTP入力画面を表示
  3. 認証アプリから6桁のコードを入力
  4. 検証成功でサインイン完了

### 3. プロフィール画面でのTOTP管理

- **対象画面**: `/u/profile` (Profile.vue → TotpSettings.vue)
- **機能**:
  - 現在のTOTP有効/無効状態の表示
  - TOTP有効化ボタン（未登録時）
  - TOTP無効化ボタン（登録済み時）

#### 有効化フロー
1. 「二要素認証を有効にする」ボタンをクリック
2. TOTP登録画面が表示
3. セッションが古い場合、再認証画面を表示
4. 再認証後、TOTP登録画面を再表示
5. QRコードをスキャン、コード入力で登録完了

#### 無効化フロー
1. 「二要素認証を無効にする」ボタンをクリック
2. 確認ダイアログを表示
3. 確認後、TOTPを無効化
4. セッションが古い場合、再認証画面を表示
5. 再認証後、自動的に無効化を再試行

## コンポーネント構成

### 新規作成コンポーネント

#### 1. TotpEnrollment.vue
**場所**: `/src/components/Auth/TotpEnrollment.vue`

**責務**: TOTP登録処理とQRコード表示

**主要機能**:
- Firebase MFA Sessionの取得
- TOTP Secretの生成
- QRコードの生成・表示（qrcodeライブラリ使用）
- マニュアル入力用のシークレットキー表示
- 認証コードの検証と登録

**Events**:
- `complete`: 登録完了時
- `skip`: スキップ時
- `needsReauth`: 再認証が必要な場合

**Error Handling**:
- `auth/requires-recent-login`: 再認証が必要（needsReauthイベント発行）
- その他のエラー: エラーメッセージ表示

#### 2. TotpVerification.vue
**場所**: `/src/components/Auth/TotpVerification.vue`

**責務**: サインイン時のTOTP検証

**Props**:
- `resolver`: MultiFactorResolver（Firebase提供）

**Events**:
- `complete`: 検証完了時
- `cancel`: キャンセル時

**主要機能**:
- TOTP factorの検索
- 認証コードの検証
- MultiFactorResolverによるサインイン完了

#### 3. ReauthenticateModal.vue
**場所**: `/src/components/Auth/ReauthenticateModal.vue`

**責務**: 機密操作前の再認証

**主要機能**:
- パスワード入力による再認証
- TOTP有効ユーザーの2段階再認証サポート
  1. パスワード認証 → `auth/multi-factor-auth-required`
  2. TOTP入力フィールド表示
  3. TOTPコード検証で再認証完了

**Events**:
- `success`: 再認証成功時
- `cancel`: キャンセル時

#### 4. TotpSettings.vue
**場所**: `/src/app/user/Profile/TotpSettings.vue`

**責務**: プロフィール画面でのTOTP管理UI

**主要機能**:
- TOTP登録状態の確認・表示
- TOTP有効化/無効化ボタン表示
- 各種モーダルの表示制御
- 再認証フローの管理

**State Management**:
- `isTotpEnrolled`: TOTP登録状態
- `showEnrollment`: 登録モーダル表示状態
- `showReauthenticate`: 再認証モーダル表示状態
- `showUnenrollmentConfirm`: 無効化確認ダイアログ表示状態
- `pendingUnenroll`: 無効化が再認証待ちかどうか

### 更新した既存コンポーネント

#### SignUpPage.vue
- TOTP登録フローの追加
- 登録完了後にTotpEnrollmentコンポーネントを表示

#### SignInPage.vue
- `auth/multi-factor-auth-required`エラーハンドリング
- TotpVerificationコンポーネントの表示制御
- ローディング状態の適切な管理

#### Profile.vue
- TotpSettingsコンポーネントの追加

## Firebase実装詳細

### TOTP登録フロー

```typescript
// 1. Multi-Factor Sessionの取得（重要）
const multiFactorSession = await multiFactor(user).getSession();

// 2. TOTP Secretの生成
const totpSecret = await TotpMultiFactorGenerator.generateSecret(multiFactorSession);

// 3. QRコード用URIの生成
const qrCodeUri = totpSecret.generateQrCodeUrl(user.email, 'OwnPlate');

// 4. QRコード画像への変換
const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUri);

// 5. ユーザーがコード入力後、登録
const assertion = TotpMultiFactorGenerator.assertionForEnrollment(
  totpSecret,
  verificationCode
);
await multiFactor(user).enroll(assertion, 'TOTP');
```

**重要なポイント**:
- `getSession()`を使用してMultiFactorSessionを取得する必要がある
- `generateQrCodeUrl()`はotpauth:// URIを返すため、qrcodeライブラリで画像に変換

### TOTP検証フロー（サインイン時）

```typescript
try {
  await signInWithEmailAndPassword(auth, email, password);
} catch (error) {
  if (error.code === 'auth/multi-factor-auth-required') {
    // Multi-Factor Resolverの取得
    const resolver = getMultiFactorResolver(auth, error);

    // TOTP factorの検索
    const totpFactor = resolver.hints.find(
      hint => hint.factorId === TotpMultiFactorGenerator.FACTOR_ID
    );

    // TOTP検証
    const assertion = TotpMultiFactorGenerator.assertionForSignIn(
      totpFactor.uid,
      totpCode
    );
    await resolver.resolveSignIn(assertion);
  }
}
```

### 再認証フロー（TOTP有効ユーザー）

```typescript
// 1. パスワード認証を試行
try {
  const credential = EmailAuthProvider.credential(email, password);
  await reauthenticateWithCredential(user, credential);
} catch (error) {
  if (error.code === 'auth/multi-factor-auth-required') {
    // 2. MFA Resolverを取得
    const resolver = getMultiFactorResolver(auth, error);

    // 3. TOTPコード入力を要求
    // （UIでTOTPフィールドを表示）

    // 4. TOTP検証で再認証完了
    const totpFactor = resolver.hints.find(
      hint => hint.factorId === TotpMultiFactorGenerator.FACTOR_ID
    );
    const assertion = TotpMultiFactorGenerator.assertionForSignIn(
      totpFactor.uid,
      totpCode
    );
    await resolver.resolveSignIn(assertion);
  }
}
```

### TOTP無効化フロー

```typescript
try {
  const enrolledFactors = multiFactor(user).enrolledFactors;
  if (enrolledFactors.length > 0) {
    await multiFactor(user).unenroll(enrolledFactors[0]);
  }
} catch (error) {
  if (error.code === 'auth/requires-recent-login' ||
      error.code === 'auth/user-token-expired') {
    // 再認証が必要
    // 再認証後、unenrollを再試行
  }
}
```

## エラーハンドリング

### auth/requires-recent-login
**発生タイミング**: TOTP登録時、TOTP無効化時

**対応**:
1. 再認証モーダルを表示
2. ユーザーがパスワード（+TOTP）で再認証
3. 元の操作を自動的に再試行

### auth/multi-factor-auth-required
**発生タイミング**: サインイン時、TOTP有効ユーザーの再認証時

**対応**:
1. MultiFactorResolverを取得
2. TOTP入力画面を表示
3. コード検証でサインイン/再認証完了

### auth/invalid-verification-code
**発生タイミング**: TOTP検証時

**対応**: エラーメッセージを表示し、再入力を促す

### auth/user-token-expired
**発生タイミング**: TOTP無効化時

**対応**: `auth/requires-recent-login`と同様の処理

## i18n対応

### 追加した翻訳キー

#### admin.totp.*
- `setup`: 二要素認証の設定
- `verification`: 二要素認証
- `scanQrCode`: QRコードをスキャン
- `orEnterManually`: 手動入力
- `enterCode`: 認証コード入力
- `codePlaceholder`: 6桁のコード
- `verificationMessage`: 認証アプリからコードを入力
- `enrollmentComplete`: 登録完了
- `error.generateFailed`: 設定失敗
- `error.invalidCode`: 無効なコード
- `error.enrollmentFailed`: 登録失敗
- `error.verificationFailed`: 検証失敗

#### auth.reauthenticate.*
- `title`: パスワードを再入力
- `message`: セキュリティ上の理由で再入力が必要
- `error.noUser`: ユーザーが見つからない
- `error.failed`: 再認証失敗

#### profile.totp.*
- `title`: 二要素認証
- `status.enabled`: 有効
- `status.disabled`: 無効
- `enable`: 二要素認証を有効にする
- `disable`: 二要素認証を無効にする
- `disableConfirmTitle`: 無効化の確認
- `disableConfirmMessage`: 本当に無効化しますか？
- `emailVerificationRequired`: メール認証が必要です
- `error.tokenExpired`: セッション期限切れ
- `error.disableFailed`: 無効化失敗

## セキュリティ考慮事項

### 1. セッション管理
- Firebaseが自動的にセッション管理を行う
- `auth/requires-recent-login`エラーで再認証を強制

### 2. QRコード生成
- QRコードはクライアント側で生成（otpauth:// URIから）
- シークレットキーは一度しか表示されない
- ページ離脱後は再取得不可

### 3. 再認証フロー
- 機密操作（TOTP無効化など）は再認証を要求
- TOTP有効ユーザーは再認証時もTOTPが必要

### 4. エラー情報
- Firebase Authのエラーコードをi18nキーに変換
- 詳細なエラー情報はコンソールログのみ（本番環境では注意）

## 依存ライブラリ

### qrcode
**バージョン**: 既存プロジェクトに導入済み

**用途**: otpauth:// URIからQRコード画像（Data URL）生成

```typescript
import QRCode from 'qrcode';
const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUri);
```

## テスト方法

### 1. 新規登録フロー
1. `/admin/user/signup`にアクセス
2. メールアドレス・パスワードで登録
3. TOTP登録画面でQRコードが表示されることを確認
4. Google Authenticator等でQRコードをスキャン
5. 表示された6桁コードを入力
6. 登録完了メッセージが表示されることを確認

### 2. サインインフロー
1. ログアウト
2. `/admin/user/signin`にアクセス
3. メールアドレス・パスワード入力
4. TOTP入力画面が表示されることを確認
5. 認証アプリから6桁コードを入力
6. サインイン成功を確認

### 3. プロフィールでの有効化
1. TOTP未登録のアカウントでサインイン
2. `/u/profile`にアクセス
3. 「二要素認証を有効にする」ボタンをクリック
4. QRコードスキャン・コード入力で登録
5. ステータスが「有効」に変わることを確認

### 4. 再認証フロー（登録時）
1. サインイン後、しばらく時間を置く（セッション期限）
2. `/u/profile`で「二要素認証を有効にする」をクリック
3. 再認証画面が表示されることを確認
4. パスワード入力
5. TOTP登録画面が表示されることを確認

### 5. 再認証フロー（無効化時）
1. TOTP有効なアカウントでサインイン
2. しばらく時間を置く
3. `/u/profile`で「二要素認証を無効にする」をクリック
4. 確認ダイアログで「無効にする」をクリック
5. 再認証画面が表示されることを確認
6. パスワード + TOTPコード入力
7. 自動的に無効化されることを確認

### 6. 再認証フロー（TOTP有効ユーザー）
1. TOTP有効なアカウントで再認証をトリガー
2. パスワード入力
3. TOTPコード入力フィールドが表示されることを確認
4. TOTPコード入力で再認証完了を確認

## 制限事項

### 1. 単一TOTP factorのみ対応
現在の実装では、1ユーザーにつき1つのTOTP factorのみをサポート。
複数のTOTP factorには対応していない。

### 2. 他のMFA方式は未対応
SMS認証、電話認証などの他のMFA方式には対応していない。

### 3. リカバリーコード未実装
TOTP紛失時のリカバリーコード機能は未実装。
TOTPを失った場合、管理者によるアカウントリセットが必要。

### 4. メール認証必須
TOTP登録にはメール認証済みアカウントが必要（UI制約）。

## 今後の拡張案

1. **リカバリーコード機能**
   - TOTP紛失時のバックアップコード生成

2. **複数デバイス対応**
   - 複数のTOTP factorを登録可能にする

3. **管理者機能**
   - ユーザーのTOTP強制解除機能

4. **監査ログ**
   - TOTP登録/解除のログ記録

5. **ユーザー通知**
   - TOTP設定変更時のメール通知

## 参考資料

- [Firebase Authentication - Multi-factor authentication](https://firebase.google.com/docs/auth/web/multi-factor)
- [RFC 6238 - TOTP: Time-Based One-Time Password Algorithm](https://datatracker.ietf.org/doc/html/rfc6238)
- [qrcode - npm package](https://www.npmjs.com/package/qrcode)
