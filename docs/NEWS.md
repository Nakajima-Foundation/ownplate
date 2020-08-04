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
src/app/admin/News/data.js (1)
```
と、今までと同様のrelease noteである
```
docs/RELEASES.md (2)
```
を更新(生成）します。

(1)は、titleと日付(ファイル名より）とmarkdownを生成して、データに追加します。
(2)は、markdownのみを連結していきます。
(2)のみ、current.mdの内容が反映されます。
