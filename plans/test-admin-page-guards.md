# 管理画面の守りを、画面を描かずに試験する道具

## なぜ

`vue-tsc` の誤りの過半は、管理画面の `setup()` にある早期 return が原因。戻り値が union に
なって template から束縛が見えなくなる。直したいが、**その早期 return は権限の無い利用者に
Firestore の読み書きを走らせない役目を持っている**。動かすなら、それが保たれていることを
示せなければならない。

守りが効いていることは「**一度も触らない**」という形でしか現れない。`notFound` が立つことを
見ても足りない — 守りを取得の後ろへ動かしても `notFound` は立ったままで、取得だけが走る。

## 何を作ったか

`setup()` を**描かずに呼んで、Firestore を触った回数を数える**道具。

- `test/helpers/vueComponentSetup.ts` — `.vue` から script を取り出し、外へ出ていく import を
  差し替えて `setup()` を呼ぶ
- `test/helpers/firestoreStub.ts` — 回数を数えるだけの Firestore
- `test/helpers/moduleStubs.ts` — 子部品と Firebase の初期化の差し替え先

これらの画面は `<script setup>` ではなく `defineComponent({ setup })` なので、script ブロックは
取り出せば素の module になる。template には触れていない。

pinia と vue-router と i18n の枠は、既にある `test/helpers/vueSetup.ts` をそのまま使う。

## まず1ファイル

`src/app/admin/Restaurants/Postage.vue`（送料の設定）。18ファイル同じ形なので、道具が正しいかを
一番小さいもので確かめる。

`test/unit/test_adminPageGuards.ts`:

- 持ち主でない利用者 → Firestore を一度も触らない、`notFound` が立つ
- 持ち主 → 自店の送料設定を1回読む
- 読む先は**経路の店舗**（props 側の id になっていると別の店舗の設定を出す）

## これは「変える前」の試験

**いまのコードに対して緑になることが要点。** 変換の後に書いた試験は、変換が正しいことを
示さない。守りを取得の後ろへ動かして赤くなることも確かめた。

## 実装は変えていない

`src/` に差分は無い。`.gitignore` に取り出した script の置き場を1行足しただけ。

## 限界

- **`setup()` だけ**。template が何を読むかは見ていない
- 偽の Firestore は手書き。知らない API を使う画面では落ちる（黙って通るのではなく落ちるので気づける）
- 子部品を空にしているので、子に渡す値は見ていない
