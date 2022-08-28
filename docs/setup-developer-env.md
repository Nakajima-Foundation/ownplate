
# 1. Homebrewをsetupする

[本家サイト](https://brew.sh/index_ja)

## 1.1. install する
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## 1.2. .zprofileに追加する
```
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### 1.2.1. 補足
-  `.zprofile` ファイルがあるかどうかを確認する方法  
	```
	cd ~
	ls -a
	```

-  `.zprofile` ファイルがない時は 1.1 を実行したときに出てくる以下のコマンド(2つ)を実行する。
	```
	echo 'eval $(/opt/homebrew/bin/brew shellenv)' >> /Users/{userName}/.zprofile
	eval $(/opt/homebrew/bin/brew shellenv)
	```

## 1.3. インストール確認コマンド  
```
brew -v
```

## 1.4. 参考になりそうなサイト
[M1 Mac (Mac mini) に GitHub CLI をインストールする](https://qiita.com/m-tmatma/items/a908422e26a70fadefdd)


# 2. Nodebrew

## 2.1. install する
```
brew install nodebrew
```

## 2.2. .zshrc に追加する

```
export PATH=$HOME/.nodebrew/current/bin:$PATH
```

### 2.2.1. 補足
-  `.zshrc` ファイルがない時はファイルを作成する  
	参考になりそうなサイト: [MacにNode.jsをnodebrewでインストールして環境構築【決定版】](https://qiita.com/7110/items/efe0be1be11bed1db143)

## 2.3. セットアップする
```
nodebrew setup
```

# 3. Nodeをインストール
## 3.1. バージョン確認
```
nodebrew ls-remote
```
で、インストール可能なバージョン一覧を調べる。

## 3.2. **16系** の最新をダウンロードする

```
nodebrew install v16.15.1 
```

## 3.3. ダウンロードした Node を指定する
```
nodebrew use v16.15.1
```

# -- (参考) 4. yarn をインストール
```
npm install -g yarn
```

# 5. 作業フォルダに移動する
`cd` コマンドを利用して、作業フォルダへ移動する

# 6. git checkout

```
git clone git@github.com:Nakajima-Foundation/ownplate.git
```

# 7. npm package install

```
npm install
```

# 8. copy configs

```
cp src/config/default/ownplate-dev.ts src/config/project.ts
```

# 9. start local server

```
VUE_APP_CIRCLE_SHA1=123123 yarn run start
```

# 10. Access your local-server
