管理系の更新情報のNewsは、バッチによって更新していきます。

更新方法は

```
$ npm run makenews
```
です

通常、更新情報は、docs/news/current.md に追記していきます。
リリースタイミングで、current.mtをYYYYMMDD.mdにrenameします。
中身１行目はtitle, それ以降はmdとなります。

コマンド実行したら、プログラムで表示する
```
src/app/admin/News/data.ts (1)
```
と、今までと同様のrelease noteである
```
docs/RELEASES.md (2)
```
を更新(生成）します。

(1)は、titleと日付(ファイル名より）とmarkdownに加えて、一覧に出す version と summary を生成して、データに追加します。

- version … titleの先頭の版（例: `v4.1.0`）
- summary … 本文の1行目の段落。段落が無く箇条書きから始まる回は「分類: 最初の項目」

一覧は本文を開かずに中身が分かる必要があるので、ここで作って持たせます。
取り出し方は `src/utils/newsList.ts` にあり、`test/unit/test_newsList.ts` が押さえています。

(2)は、markdownのみを連結していきます。
(2)のみ、current.mdの内容が反映されます。
