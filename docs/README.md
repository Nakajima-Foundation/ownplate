- [リリースノート](./RELEASES.md)
- [ドキュメント関連リンク](RelatedLink.md)
- [サービス内で使っている音源へのリンク](SOUND.md)

# 設定

- [Line LIFFの初期設定](./CONFIGURATIONS.md#LIFF)
- [Storageの設定](./CONFIGURATIONS.md#storage-cors)

# 仕様
- [Database](./DATABASE.md)
- [Line, メール, 電話通知の挙動](./NOTIFICATION.md)
- [更新履歴(ChangeLog)の仕様](./NEWS.md)
- [Order Stateの仕様メモ](./ORDER_STATE.md)
- [Orderの時間についての仕様メモ](./STATE_TIME.md)
- [Order時に呼ばれるFunctionsの関数](../functions/README.md)

# development

### Release noteについて

docs/news にデータを追加後、

```
yarn run makenews
```

でrelease noteが更新される

### 飲食店向けのマニュアル

`docs/article2xxxx` 以下に、markdownでマニュアルを作成し、その後

- Article追加 [src/app/admin/Docs/Article.vue](https://github.com/Nakajima-Foundation/ownplate/blob/main/src/app/admin/Docs/Article.vue)

- 一覧に追加 [src/app/admin/Docs/Index.vue](https://github.com/Nakajima-Foundation/ownplate/blob/main/src/app/admin/Docs/Index.vue)

の作業が必要となる
