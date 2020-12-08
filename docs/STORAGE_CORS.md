PDF印刷用にcloud storageのCORSを設定する必要がある。

# Google Cloud Shell を開く

https://console.cloud.google.com/home/dashboard?project=ownplate-dev&cloudshell=true&hl=ja

# 設定ファイルを作る
vi a.json
[
  {
    "origin": ["http://localhost:3000", "https://staging.ownplate.today"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]

[
  {
    "origin": ["http://localhost:3000", "https://omochikaeri.com"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]

# デプロイ

```
gsutil cors set a.json gs://ownplate-dev.appspot.com
```
