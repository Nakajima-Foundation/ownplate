# 早期 return の戻り値が判別できる union になるようにする

## 何が起きていたか

管理画面18ファイルの `setup()` は、権限が無ければ早期に返す。

```js
if (!checkShopAccount(props.shopInfo, ownerUid.value)) {
  return notFoundResponse;
}
...
return { postage, enableFree, notFound: false, ... };
```

`notFoundResponse` は `{ notFound: true }` と書いてあるが、**オブジェクトリテラルの
プロパティは型が広がる**ので、実際の型は `{ notFound: boolean }`。すると `setup()` の
戻り値は

```
{ notFound: boolean } | { notFound: boolean, postage, ... }
```

という **判別子が両側とも `boolean` の union** になり、どちらの枝か決められない。
Vue の型は両側に共通するものしか見せないので、**template から束縛がまったく見えなくなる**。
1ファイルで100件級の誤りが出ていたのはこれ。

## 直し方

型注釈で `true` に留める。それだけ。

```ts
export const notFoundResponse: { notFound: true } = {
  notFound: true,
};
```

判別できる union になり、18ファイル同時に template の型検査が戻る。

## 測ったこと

|                              | 前    | 後                |
| ---------------------------- | ----- | ----------------- |
| `vue-tsc` 全体               | 1056  | 486               |
| 誤りが増えたファイル         | —     | なし              |
| 管理画面以外のファイル       | —     | 変化なし          |
| `utils.ts` の出力 JavaScript | 720行 | 720行・バイト一致 |

同じ作業木で `utils.ts` だけを前後に往復させて、1056 ⇄ 486 を確かめた。差分は
`utils.ts` のみ。

## 採らなかった案

早期 return を動かす方向も測ったが、いずれもこれより悪い。

| 案                                       | 対象1ファイルの誤り | 問題                                                      |
| ---------------------------------------- | ------------------- | --------------------------------------------------------- |
| 宣言を守りの前に上げ、取得を `if` で囲む | 9 → 1               | **守りが30行下がる。** 後ろに取得を足したとき守られない   |
| 束縛を任意（`Partial`）にする            | 9 → 4               | 誤りが template 側へ移るだけ                              |
| ファイルごとに union を宣言する          | 9 → 2               | 18ファイルに同じものを書くことになる。根本は共有側の1箇所 |

**早期 return は安全性と保守性のために要る**ので、それを動かさずに済む形を採った。
この変更では18ファイルのいずれも1文字も動いていない。

## 残っている486件

早期 return とは無関係。多いのは `Restaurants/Index.vue` 49、`admin/Index.vue` 41、
`OrderInfoPage.vue` 27。種類は `TS2339` 137・`TS2345` 82・`TS2322` 52 で、`TS2345` の
多くは props が `type: Object` 宣言で `Record<string, any>` になっているもの。別に扱う。
