# Callable Functions の権限判定に試験を足す

## なぜ

`functions/src/lib/utils.ts` の `validate_*` は、Callable Functions の権限の入口。
ここを抜けた呼び出しは、その uid のものとして注文や店舗の情報を触る。試験が一つも無かった。

見分けの土台は token の中身:

- 注文者はショートメッセージで認証するので `phone_number` が入る
- 店舗の管理者はメールで認証するので `email` が入る
- サブアカウントには親の uid が `parentUid` として入る

## 足したもの

`functions/tests/unit/auth_test.ts`（`yarn ci_test` の対象）。種別ごとの呼び出し元を
用意して、通る／弾かれるを両方向から見ている。

留めた決まりのうち、取り違えると効き方が変わるもの:

- **`validate_customer_auth` は管理者を通さない**、**`validate_admin_auth` は注文者を通さない**。
  電話番号とメールのどちらを見るかで入口が分かれている
- **`validate_owner_admin_auth` はサブアカウントに親の uid を返す。** 自分の uid を返すと、
  親の店舗ではなく存在しない自分の店舗を触ることになる
- **`validate_parent_admin_auth` はサブアカウントを弾く。** メールで認証していても通さない
  （サブアカウントの作成や削除など、子に任せられない操作のための入口）
- **`is_admin_auth` は真偽を返すが、署名が無ければ弾く。**
  **`is_subAccount` は弾かずに false を返す。** 二つの振る舞いが違う
- **`required_params` が見ているのは `undefined` だけ。** 空文字も `null` も 0 も
  「入っている」扱い

## 確かめ方

`cd functions && yarn ci_test` が緑。`yarn lint` と `yarn build` も通る。
実装には触れていない。
