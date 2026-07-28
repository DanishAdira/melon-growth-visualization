# メロン生育過程評価システム（Melonyzer）

温室メロン栽培における生育過程を可視化・評価するWebアプリケーションです．深層学習・IoT（PiNode3を使用）・AWS（Amazon Web Services）を用いたメロン生育過程評価システム（通称Melonyzer）のフロントエンドを構成します．

本リポジトリは，IPSJ 第88回全国大会「網目構造と生長曲線に基づくメロン生育過程の可視化」の成果物として公開しているものです．

## システム概要図

本システムのクライアント層（Webアプリケーション）に相当します．

| 層 | 役割 |
| --- | --- |
| **エッジ層** | 計測デバイス (PiNode3) による画像・環境データの収集 |
| **クラウド処理層** | AWS上のサーバレスパイプラインによる深層学習推論と時系列処理 |
| **クライアント層** | 解析結果を可視化するWebアプリケーション |

<img width="710" height="559" alt="Image" src="https://github.com/user-attachments/assets/2cfe7494-b1e5-40f8-a486-0ee19d46b1bd" />

### クラウド処理層の概要（参考）

本システムがAWS AppSync経由で参照するDynamoDBのデータは，AWS上で以下のように処理されます．これらの処理は1日に1回や勘にまとめてバッチ処理で行われます．

- **画像解析**：Amazon SageMakerAI上で，YOLO-11nsegによる果実領域の検出とU-Netによる網目領域の検出
- **外観特徴算出**：網目密度・分岐点数・縦/横方向の網目形成量・推定体積などを算出
- **日次サマリ**：時系列ノイズ処理を行い，1日の生育サマリーを算出

## リポジトリ構成

```
├── amplify/                       # AWS Amplify プロジェクト設定
├── public/                        # 静的ファイル
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.tsx      # アプリケーションヘッダー
│   │   │   └── AppFooter.tsx      # アプリケーションフッター
│   │   ├── ControlPanel.tsx       # 季節・交配日・デバイス・メロン選択パネル
│   │   ├── InfoPanel.tsx          # メロン情報・生長モデル差分表示
│   │   ├── ImagePanel.tsx         # 撮影画像・網目マスク表示 (S3 署名付き URL)
│   │   ├── GrowthChart.tsx        # 外観特徴推移 + 生長モデル曲線
│   │   └── RealtimeDashboard.tsx  # リアルタイム環境データ・最新画像表示
│   ├── graphql/
│   │   └── queries.ts             # AppSync GraphQL クエリ定義
│   ├── types.ts                   # 型定義
│   ├── App.tsx                    # ルートコンポーネント
│   └── index.tsx                  # エントリポイント
├── package.json
└── README.md

```

## UI

### 生育サマリー確認画面

計測中のメロンごとの外観特徴の（網目密度・分岐点数・縦/横方向の網目形成量・推定体積）の推移を，各季節ごとの代表的な生長モデルと重ねてプロットします．

<img width="3196" height="1647" alt="Image" src="https://github.com/user-attachments/assets/1befd7cf-18c1-47dc-b295-a2c6c0b4bdcc" />

### リアルタイム栽培状況確認画面

計測ハウス内の最新の温湿度，外部照度，内部照度，直近数時間の時系列推移，および定点カメラ（Spresense）の最新画像を表示します．

<img width="3195" height="1522" alt="Image" src="https://github.com/user-attachments/assets/00b03d5a-9a23-4aaf-871d-b18d0a31222e" />

## セットアップ（研究室向け）

### 前提条件

- Node.js 18 以上
- npm

### 手順

```bash
# リポジトリのクローン
git clone https://github.com/DanishAdira/melon-growth-visualization.git
cd melon-growth-visualization

# 依存関係のインストール
npm install

# 開発サーバの起動
npm start
```

### 環境変数

本番環境では**AWS Amplifyのホスティングで環境変数を管理**しています．ローカルで動作確認する際は，リポジトリのルートに`.env`ファイルを作成してください．

```env
REACT_APP_AWS_REGION=ap-northeast-1
REACT_APP_APPSYNC_ENDPOINT=<AppSync GraphQL エンドポイント URL>
REACT_APP_APPSYNC_API_KEY=<AppSync API キー>
REACT_APP_COGNITO_USER_POOL_ID=<Cognito User Pool ID>
REACT_APP_COGNITO_APP_CLIENT_ID=<Cognito App Client ID>
REACT_APP_S3_BUCKET_NAME=<画像・マスクを配置している S3 バケット名>
```

## デプロイ

AWS Amplify Hostingによりデプロイしています．`main` ブランチへのマージをトリガーに自動ビルド・デプロイされる設定になっています．

### 謝辞
本研究は，JST 創発的研究支援事業 (JP-MJFR201B) の支援を受けたものです．