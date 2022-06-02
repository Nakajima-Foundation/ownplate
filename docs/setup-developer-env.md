
# Homebrewをsetupする

[本家サイト](https://brew.sh/index_ja)

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

.zprofileに追加
```
eval "$(/opt/homebrew/bin/brew shellenv)"
```



# Nodebrew

```
brew install nodebrew
```

.zshrcに追加

```
export PATH=$HOME/.nodebrew/current/bin:$PATH
```

```
nodebrew setup
```

# Nodeをインストール

```
nodebrew ls-remote
```
で、確認

16系の最新を入れる

```
nodebrew install v16.15.1 
```

```
nodebrew use v16.15.1
```

# git checkout

```
git clone git@github.com:Nakajima-Foundation/ownplate.git
```

# npm package install

```
yarn install
```

# copy configs

```
cp src/config/default/ownplate-dev.ts src/config/project.ts
```

# start local server

```
VUE_APP_CIRCLE_SHA1=123123 \
VUE_APP_GAPIKey=xxxx yarn run start
```
