# MiMi API 開発ガイド

## 前提条件
- Node.js v22
- Java Runtime Environment (Firebase Emulator用)
- npm
- Docker (ローカルDBの起動に使用)

## プロジェクトのセットアップ
1. Javaのインストール (未インストールの場合)
    ```
    # macOSの場合
    $ brew install openjdk@17
    # シンボリックリンクの作成
    $ sudo ln -sfn $(brew --prefix)/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk

    # インストールの確認
    $ java -version
    ```

1. Firebase Toolsのインストール
    ```
    $ curl -sL https://firebase.tools | bash
    $ firebase login # エミュレータ動かすだけならどこにログインしても良いはず
    ```

1. プロジェクトのインストール
    ```
    $ git clone git@github.com:dotback/mimi_hackathon_api_server.git
    $ cd mimi_hackathon_api_server/functions

    # 依存関係のインストール
    $ npm install
    ```

1. 環境変数の設定
    ```
    $ cp .env.sample .env
    $ vi .env # Gemini api keyを設定
    ```

1. DBの設定
    ```
    $ docker compose up -d
    $ npm run prisma:migrate
    ```


## 開発
### デプロイ
```
# package.jsonに加える
    "postinstall": "npx prisma generate --schema ./dist/shared/prisma/schema.prisma" // for deploy
```

### エミュレータの起動
```
$ npm run build:watch # watch modeで実行したい場合別ターミナルでこれ実行、なくても良い
$ npm run serve
```


`http://127.0.0.1:5001/mimi-dev-c7ee3/us-central1/hello` にブラウザでアクセスしてHello, World!が表示されたら成功  
期待されるレスポンス：
```
{
  "message": "Hello, World!"
}
```

### プロジェクト構造
```
functions/
├── src
│   ├── configs          # 設定ファイル
│   ├── contexts
│   │   ├── common       # 共通コンテキスト
│   │   ├── system
│   │   └── users        # ユーザーコンテキスト
│   ├── shared
│   │   ├── database     # prismaの初期化とか
│   │   ├── openapi
│   │   ├── prisma       # Schema定義とか
│   │   └── utils
│   ├── types            # 広めの共通型定義
│   └── index.ts
├── dist/                # buildアウトプット先
├── openapi.json         # API定義、多分要らない
├── package.json
├── tsconfig.json
└── .env
```

### 開発手順
基本的にcontextsの下にコードを書いていく。共通化したい処理があれば適宜libなりcommonに切り出す。  
`contexts` の下フォルダで `requestHandlers` に作成したControllerを登録した後、 `src/index.ts` でexportしfirebase functionsに登録する。  
DBのスキーマ変更をしたい場合は `prisma/schema.prisma` を編集して `npm run prisma:migrate:dev` を実行する。  

## トラブルシューティング
### エミュレータが起動しない場合
1. Javaが正しくインストールされているか確認
    ```
    $ java -version
    $ which java
    ```

1. 必要なポートが使用可能か確認
    - 4000: エミュレータUI
    - 5001: Functions
    - 9099: Auth

### モジュールが見つからないエラーが出る場合
1. ビルド出力を確認
    ```
    npm run build
    ```

1. libディレクトリの内容を確認
    ```
    ls -R lib/
    ```

1. 必要に応じてlibディレクトリを削除して再ビルド
    ```
    rm -rf lib/
    npm run build
    ```

### その他
- Firebase Emulatorのログはfirebase-debug.logを確認
- Functions固有のログはfunctions-debug.logを確認
- OpenAPI仕様書の生成は `npm run generate-openapi` で実行
